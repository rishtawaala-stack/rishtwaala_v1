const { z } = require("zod");

const uuidSchema = z.string().uuid();

const requestEnvelopeSchema = z.object({
  body: z.any().optional(),
  query: z.record(z.any()).optional(),
  params: z.record(z.any()).optional(),
  headers: z.record(z.any()).optional()
});

module.exports = {
  z,
  uuidSchema,
  requestEnvelopeSchema
};
