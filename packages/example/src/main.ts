import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";

main();
async function main() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
