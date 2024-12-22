import { Module } from "@nestjs/common";
import { ConfigModule } from "@jqgl/nest-json-config";

import { schema } from "./app-config.schema";

@Module({
  imports: [ConfigModule.forRootAsync({ schema: schema.parseAsync })],
  exports: [ConfigModule],
})
export class AppConfigModule {}
