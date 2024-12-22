# Nest JSON Config

Provide a simple way to use multiple JSON files for configuration in your [Nest.JS](https://nestjs.com) project.

> [!WARNING]
> At the moment, this lib only works with node >=16.7.0

## Dependencies

Appart from nest dependencies, the only real dependency is [deepmerge](https://www.npmjs.com/package/deepmerge).

## Getting Started

To locate JSON files, you can provide a simple environment variable at the start of your project

```bash
NEST_CONFIG_PATHS=config.json,secrets.json node ./main
```

It's also possible to provide the files as CLI input

```bash
node ./main --config=config.json,secrets.json
```

### Usage

```typescript
// config.schema.ts
import { z } from 'zod';

export const schema = z.object({
  database: z.object({ url: z.string().startsWith('postgresql://').url() })
});
export type Configuration = z.infer<typeof schema>;

declare module '@jqgl/nest-json-config' {
  interface Config extends Configuration {}
}

// ----
// config.module.ts - Your own Configuration module
import { ConfigModule } from '@jqgl/nest-json-config';
import { schema } from './config.schema';

// optionnally @Global()
@Module({
  exports: [ConfigModule],
  imports: [
    ConfigModule.forRootAsync({
      schema: (config: object) => schema.parseAsync(config)
    })
  ]
})
export class AppConfigModule {}

// ----
// app.service.ts
import { Config } from '@jqgl/nest-json-config';

@Injectable()
export class AppService {
  private readonly databaseUrl: string;
  constructor({ database }: Config) {
    this.databaseUrl = config.database.url;
  }
}
```

## Customization

### Environment variable

You can customize the environment variable from which we read the list of json files

```typescript
@Module({
  imports: [
    ConfigModule.forRootAsync({
      envvarName: 'MY_CONF'
      // ...
    })
  ]
})
```

### Injection

You might have noticed the [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).

```typescript
declare module '@jqgl/nest-json-config' {
  interface Config extends Configuration {}
}
```

This is a trick to register the configuration using a class token `Config` and merging your
configuration schema with it. You thus have auto-completion and no need for a cumbersome `@Inject`.

This behavior, is completely optional. You can use the default `Config` token without any declaration merging,
but you won't have auto-completion, and will resolve to `any`. You can also use `@Inject(Config)` and provide
your own type.

A third option, is to register a custom token, which is especially usefull, if your schema is already a class:

```typescript
// app-config.module.ts
import { plainToInstances, Type } from 'class-transformer';
imort { validateOrReject, IsUrl, ValidateNested } from 'class-validator';

class DatabaseConfiguration {
  @IsUrl()
  url: string;
}

export class ConfigurationSchema {
  @ValidateNested()
  @Type(() => DatabaseConfiguration)
  database: DatabaseConfiguration;
}

async function schema(config: object): Promise<ConfigurationSchema> {
  const c = plainToInstance(ConfigurationSchema, config)
  await validateOrReject(c);
  return c;
}

@Module({
  imports: [
    ConfigModule.forRootAsync({
      schema,
      configToken: ConfigurationSchema,
    })
  ]
})
class AppConfig {}

// ----
// app.service.ts
import { ConfigurationSchema } from './app-config';
@Injectable()
export class AppService {
  constructor(config: ConfigurationSchema) {}
}
```

### Migration from [@nestjs/config](https://docs.nestjs.com/techniques/configuration)

Nest provide a dotenv wrapper, which exposes a `ConfigService`.
Simply replace your import from `nestjs` to this service.

You might prefer to use the direct object access in future refactors.

```diff
- import { ConfigService } from '@nestjs/config';
+ import { ConfigService } from '@jqgl/nest-json-config';

@Injectable()
export class AppService {
  private readonly databaseUrl: string;
  constructor(config: ConfigService<Configuration>) {
    this.databaseUrl = config.get('database.url');
  }
}
```


## Questions

### How to override the configuration on my local environment

Ususally we differenciate, configuration from secrets. The key diference is that configuration
can usually live inside your repository. Provide a basic configuration file, and adapt your running
scripts to load those files.

You can use local files, that are not included in git for individual configurations, or even include a
envvar override mechanism in your schema.

For example, this will use the envvar `DATABASE_URL` before any value in the configuration file:

```typescript
import { z } from 'zod';
const schema = z.object({
  database: z.object({
    url: z.preprocess(
      (val) => process.env.DATABASE_URL ?? String(val),
      z.string().url(),
    )
  })
})
```

### In what order are JSON files loaded

Left to right. We initialize the configuration as a simple object, and each following file will
merge its content in the configuration using [deepmerge](https://www.npmjs.com/package/deepmerge).

### Why should my schema validation be async

To prevent locking the event loop on application start. Transformation and validation are heavy processes
that are often responsible for event loop lag.
