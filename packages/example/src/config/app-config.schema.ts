import { z } from "zod";

export const schema = z.object({
  remoteBlog: z.object({
    baseUrl: z.preprocess(
      (value) => process.env.APP__REMOTE_BLOG__BASE_URL ?? value,
      z
        .string()
        .url()
        .regex(/[^\/]$/),
    ),
  }),
});
