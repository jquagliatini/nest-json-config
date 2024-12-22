import { Module } from "@nestjs/common";
import { AppConfigModule } from "../config";
import { HttpModule } from "../http";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [AppConfigModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
