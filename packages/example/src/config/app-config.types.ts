import { z } from "zod";
import { schema } from "./app-config.schema";

export type Configuration = z.infer<typeof schema>;

declare module "@jqgl/nest-json-config" {
  interface Config extends Configuration {}
}
