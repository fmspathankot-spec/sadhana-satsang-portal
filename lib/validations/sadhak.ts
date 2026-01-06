import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const sadhakSchema = z.object({
  placeId: z
    .number({
      required_error: 'स्थान चुनना आवश्यक है',
      invalid_type_error: 'स्थान एक संख्या होनी चाहिए',
    })
    .int('स्थान एक पूर्णांक होना चाहिए')
    .positive('स्थान सकारात्मक होना चाहिए'),
  
  serialNumber: z
    .number()
    .int('क्रमांक एक पूर्णांक होना चाहिए')
    .positive('क्रमांक सकारात्मक होना चाहिए')
    .optional()
    .nullable(),
  
  name: z
    .string()
    .min(2, 'नाम कम से कम 2 अक्षर का होना चाहिए')
    .max(100, 'नाम 100 अक्षर से अधिक नहीं हो सकता')
    .trim(),
  
  age: z
    .number({
      invalid_type_error: 'उम्र एक संख्या होनी चाहिए',
    })
    .int('उम्र एक पूर्णांक होनी चाहिए')
    .min(1, 'उम्र कम से कम 1 होनी चाहिए')
    .max(120, 'उम्र 120 से अधिक नहीं हो सकती')
    .optional()
    .nullable(),
  
  lastHaridwarYear: z
    .number()
    .int('वर्ष एक पूर्णांक होना चाहिए')
    .min(1950, 'वर्ष 1950 से कम नहीं हो सकता')
    .max(currentYear, `वर्ष ${currentYear} से अधिक नहीं हो सकता`)
    .optional()
    .nullable(),
  
  otherLocation: z
    .string()
    .max(100, 'स्थान 100 अक्षर से अधिक नहीं हो सकता')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  dikshitYear: z
    .number()
    .int('वर्ष एक पूर्णांक होना चाहिए')
    .min(1950, 'वर्ष 1950 से कम नहीं हो सकता')
    .max(currentYear, `वर्ष ${currentYear} से अधिक नहीं हो सकता`)
    .optional()
    .nullable(),
  
  dikshitBy: z
    .string()
    .max(200, 'नाम 200 अक्षर से अधिक नहीं हो सकता')
    .default('डॉ. श्री विश्वामित्र जी महाराज'),
  
  isFirstEntry: z
    .boolean()
    .default(false),
  
  relationship: z
    .string()
    .max(50, 'संबंध 50 अक्षर से अधिक नहीं हो सकता')
    .optional()
    .nullable()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (!data.isFirstEntry && !data.lastHaridwarYear) {
      return false;
    }
    return true;
  },
  {
    message: 'यदि प्रथम प्रविष्ट नहीं है तो अंतिम हरिद्वार वर्ष आवश्यक है',
    path: ['lastHaridwarYear'],
  }
);

export const sadhakUpdateSchema = sadhakSchema.partial();

export type SadhakInput = z.infer<typeof sadhakSchema>;
export type SadhakUpdateInput = z.infer<typeof sadhakUpdateSchema>;