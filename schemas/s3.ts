import { z } from "zod";

export const s3ParamsSchema = z.object({
  url: z.string(),
  key: z.string(),
  "content-type": z.string(),
  Expires: z.string(),
  policy: z.string(),
  "x-amz-credential": z.string(),
  "x-amz-algorithm": z.string(),
  "x-amz-date": z.string(),
  "x-amz-signature": z.string(),
})

export type S3Params = z.infer<typeof s3ParamsSchema>
