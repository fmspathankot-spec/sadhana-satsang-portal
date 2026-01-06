import { z } from 'zod';

export const eventSchema = z.object({
  eventName: z
    .string()
    .min(5, 'कार्यक्रम का नाम कम से कम 5 अक्षर का होना चाहिए')
    .max(200, 'कार्यक्रम का नाम 200 अक्षर से अधिक नहीं हो सकता'),
  
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? val : val.toISOString().split('T')[0])),
  
  endDate: z
    .string()
    .or(z.date())
    .transform((val) => (typeof val === 'string' ? val : val.toISOString().split('T')[0])),
  
  location: z
    .string()
    .min(2, 'स्थान कम से कम 2 अक्षर का होना चाहिए')
    .max(100, 'स्थान 100 अक्षर से अधिक नहीं हो सकता'),
  
  organizerName: z
    .string()
    .max(100, 'आयोजक का नाम 100 अक्षर से अधिक नहीं हो सकता')
    .optional()
    .nullable(),
  
  organizerAddress: z
    .string()
    .max(500, 'पता 500 अक्षर से अधिक नहीं हो सकता')
    .optional()
    .nullable(),
  
  organizerPhone: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'कृपया सही फोन नंबर दर्ज करें')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  organizerEmail: z
    .string()
    .email('कृपया सही ईमेल दर्ज करें')
    .optional()
    .nullable()
    .or(z.literal('')),
}).refine(
  (data) => {
    return new Date(data.endDate) >= new Date(data.startDate);
  },
  {
    message: 'समाप्ति तिथि प्रारंभ तिथि के बाद होनी चाहिए',
    path: ['endDate'],
  }
);

export const eventUpdateSchema = eventSchema.partial();

export type EventInput = z.infer<typeof eventSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;