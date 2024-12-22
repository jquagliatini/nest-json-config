import { DynamicModule, InjectionToken, Module } from "@nestjs/common";
import { BasicConfig } from "./types";
import { Config, LOADED_CONFIG } from "./constants";
import { load } from "./config-loader";
import { ConfigService } from "./config.service";

@Module({})
export class ConfigModule {
  static async forRootAsync<C extends BasicConfig>(options: {
    schema: (config: object) => Promise<C>;
    envvarName?: string;
    configToken?: InjectionToken<C>;
  }): Promise<DynamicModule> {
    const config = await options.schema(
      await load({ envvarName: options.envvarName }),
    );

    return {
      module: ConfigModule,
      exports: [ConfigService, options.configToken ?? Config],
      providers: [
        ConfigService,
        { useValue: config, provide: LOADED_CONFIG },
        { useExisting: LOADED_CONFIG, provide: options.configToken ?? Config },
      ],
    };
  }
}
