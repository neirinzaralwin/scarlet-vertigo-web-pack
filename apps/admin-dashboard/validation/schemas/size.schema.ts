import { z } from 'zod';

export const SizeSchema = z.object({
    id: z.string(),
    name: z.string(),
});
