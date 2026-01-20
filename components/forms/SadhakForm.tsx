'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const sadhakSchema = z.object({
  eventId: z.number().min(1, 'सत्संग चुनना आवश्यक है'),
  placeName: z.string().min(2, 'स्थान का नाम आवश्यक है'),
  name: z.string().min(2, 'नाम आवश्यक है'),
  gender: z.enum(['male', 'female'], { required_error: 'लिंग चुनना आवश्यक है' }),
  phone: z.string().optional().nullable(),
  age: z.coerce.number().optional().nullable(),
  lastHaridwarYear: z.coerce.number().optional().nullable(),
  otherLocation: z.string().optional().nullable(),
  dikshitYear: z.coerce.number().optional().nullable(),
  dikshitBy: z.string().default('डॉ. श्री विश्वामित्र जी महाराज'),
  isFirstEntry: z.boolean().default(false),
  relationship: z.string().optional().nullable(),
});

type SadhakFormData = z.infer<typeof sadhakSchema>;

interface SadhakFormProps {
  eventId: number;
  placeId: number; // Not used anymore, kept for compatibility
  onSuccess: () => void;
}

// Hindi place names
const PLACES = [
  'पठानकोट',
  'हरयाल',
  'करोली',
  'इंदौरा',
  'गंदराण',
  'सरना',
  'नरोट मेहरा',
  'अमृतसर',
  'जम्मू',
  'जवाली',
];

export default function SadhakForm({ eventId, placeId, onSuccess }: SadhakFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [nextSerialNumber, setNextSerialNumber] = useState<number>(1);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SadhakFormData>({
    resolver: zodResolver(sadhakSchema),
    defaultValues: {
      eventId,
      dikshitBy: 'डॉ. श्री विश्वामित्र जी महाराज',
      isFirstEntry: false,
    },
  });

  const isFirstEntry = watch('isFirstEntry');
  const selectedPlaceName = watch('placeName');

  // Fetch next serial number based on placeName and eventId
  useEffect(() => {
    const fetchNextSerialNumber = async () => {
      if (!selectedPlaceName) {
        setNextSerialNumber(1);
        return;
      }

      try {
        const response = await fetch(`/api/sadhaks?eventId=${eventId}`);
        const data = await response.json();
        
        // Filter by placeName and find the highest serial number
        const placeSpecificSadhaks = data.filter(
          (sadhak: any) => sadhak.placeName === selectedPlaceName
        );
        
        const maxSerial = placeSpecificSadhaks.reduce((max: number, sadhak: any) => {
          return sadhak.serialNumber > max ? sadhak.serialNumber : max;
        }, 0);
        
        setNextSerialNumber(maxSerial + 1);
      } catch (error) {
        console.error('Error fetching serial number:', error);
        setNextSerialNumber(1);
      }
    };

    fetchNextSerialNumber();
  }, [selectedPlaceName, eventId]);

  const onSubmit = async (data: SadhakFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);

    try {
      const cleanData = {
        ...data,
        placeId: null, // Send null since we're using placeName
        serialNumber: nextSerialNumber, // Auto-assign serial number
        age: data.age || null,
        phone: data.phone || null,
        lastHaridwarYear: data.lastHaridwarYear || null,
        otherLocation: data.otherLocation || null,
        dikshitYear: data.dikshitYear || null,
        relationship: data.relationship || null,
      };

      console.log('Sending to API:', cleanData);

      const response = await fetch('/api/sadhaks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create sadhak');
      }

      const result = await response.json();
      console.log('Success:', result);
      
      // Increment serial number for next entry
      setNextSerialNumber(nextSerialNumber + 1);
      
      reset({
        eventId,
        placeName: data.placeName, // Keep the same place selected
        dikshitBy: 'डॉ. श्री विश्वामित्र जी महाराज',
        isFirstEntry: false,
      });
      
      // Wrap ALL state updates and callbacks in setTimeout
      setTimeout(() => {
        toast.success(`साधक सफलतापूर्वक जोड़ा गया! क्रमांक: ${nextSerialNumber} ✅`);
        onSuccess();
      }, 0);
    } catch (error) {
      console.error('Submit error:', error);
      // Wrap error toast in setTimeout too
      setTimeout(() => {
        toast.error(error instanceof Error ? error.message : 'साधक जोड़ने में त्रुटि हुई');
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Auto Serial Number Display */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">अगला क्रमांक (Auto)</p>
            <p className="text-2xl font-bold text-orange-600">{nextSerialNumber}</p>
          </div>
          <div className="text-4xl">🔢</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Place Name - Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            स्थान <span className="text-red-500">*</span>
          </label>
          <select
            {...register('placeName')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">स्थान चुनें</option>
            {PLACES.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
          {errors.placeName && (
            <p className="text-red-500 text-sm mt-1">{errors.placeName.message}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            नाम <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="श्रीमती तमन्ना"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            लिंग <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="male"
                {...register('gender')}
                className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">पुरुष (Male)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="female"
                {...register('gender')}
                className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700">महिला (Female)</span>
            </label>
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            फोन नंबर
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="9876543210"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            उम्र
          </label>
          <input
            type="number"
            {...register('age')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="25"
          />
          {errors.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संबंध (Relationship)
          </label>
          <input
            type="text"
            {...register('relationship')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="पत्नी, पुत्र, पुत्री, आदि"
          />
          {errors.relationship && (
            <p className="text-red-500 text-sm mt-1">{errors.relationship.message}</p>
          )}
        </div>

        {/* Last Haridwar Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            पिछली बार हरिद्वार कब गए (वर्ष)
          </label>
          <input
            type="number"
            {...register('lastHaridwarYear')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="2023"
          />
          {errors.lastHaridwarYear && (
            <p className="text-red-500 text-sm mt-1">{errors.lastHaridwarYear.message}</p>
          )}
        </div>

        {/* Other Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            अन्य स्थान (Other Location)
          </label>
          <input
            type="text"
            {...register('otherLocation')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="यदि कोई अन्य स्थान हो"
          />
          {errors.otherLocation && (
            <p className="text-red-500 text-sm mt-1">{errors.otherLocation.message}</p>
          )}
        </div>

        {/* Dikshit Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दीक्षित वर्ष (Dikshit Year)
          </label>
          <input
            type="number"
            {...register('dikshitYear')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="2020"
          />
          {errors.dikshitYear && (
            <p className="text-red-500 text-sm mt-1">{errors.dikshitYear.message}</p>
          )}
        </div>

        {/* Dikshit By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दीक्षित किसके द्वारा (Dikshit By)
          </label>
          <input
            type="text"
            {...register('dikshitBy')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
            readOnly
          />
          {errors.dikshitBy && (
            <p className="text-red-500 text-sm mt-1">{errors.dikshitBy.message}</p>
          )}
        </div>
      </div>

      {/* First Entry Checkbox */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <input
          type="checkbox"
          {...register('isFirstEntry')}
          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label className="text-sm font-medium text-gray-700">
          प्रथम प्रविष्ट (First Entry) - क्या यह पहली बार है?
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md"
        >
          {isLoading ? 'जोड़ा जा रहा है...' : 'साधक जोड़ें'}
        </button>
      </div>
    </form>
  );
}