import { z } from 'zod';

export const placeSchema = z.object({
  name: z
    .string()
    .min(2, 'नाम कम से कम 2 अक्षर का होना चाहिए')
    .max(100, 'नाम 100 अक्षर से अधिक नहीं हो सकता'),
  contactPerson: z
    .string()
    .max(100, 'संपर्क व्यक्ति का नाम 100 अक्षर से अधिक नहीं हो सकता')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, 'पता 500 अक्षर से अधिक नहीं हो सकता')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'कृपया सही फोन नंबर दर्ज करें')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z
    .string()
    .email('कृपया सही ईमेल दर्ज करें')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const placeUpdateSchema = placeSchema.partial();

export type PlaceInput = z.infer<typeof placeSchema>;
export type PlaceUpdateInput = z.infer<typeof placeUpdateSchema>;