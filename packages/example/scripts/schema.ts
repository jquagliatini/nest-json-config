import * as fs from "node:fs/promises";
import * as path from "node:path";

import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

import { schema } from "../src/config/app-config.schema";

exportSchema();
async function exportSchema() {
  const jsonSchema = zodToJsonSchema(
    schema.extend({
      $schema: z.string().optional(),
    }),
  );
  await fs.writeFile(
    path.join(__dirname, "..", "config", "schema.json"),
    JSON.stringify(jsonSchema, null, 2),
    "utf-8",
  );
}
