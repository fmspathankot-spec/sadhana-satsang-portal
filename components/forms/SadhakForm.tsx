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

      toast.success(`साधक सफलतापूर्वक जोड़ा गया! क्रमांक: ${nextSerialNumber} ✅`);
      
      // Increment serial number for next entry
      setNextSerialNumber(nextSerialNumber + 1);
      
      reset({
        eventId,
        placeName: data.placeName, // Keep the same place selected
        dikshitBy: 'डॉ. श्री विश्वामित्र जी महाराज',
        isFirstEntry: false,
      });
      
      // Wrap onSuccess in setTimeout to avoid setState during render
      setTimeout(() => {
        onSuccess();
      }, 0);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'साधक जोड़ने में त्रुटि हुई');
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
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संबंध
          </label>
          <select
            {...register('relationship')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">चुनें</option>
            <option value="पति">पति</option>
            <option value="पत्नी">पत्नी</option>
            <option value="पुत्र">पुत्र</option>
            <option value="पुत्री">पुत्री</option>
            <option value="माता">माता</option>
            <option value="पिता">पिता</option>
          </select>
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
            placeholder="48"
          />
        </div>

        {/* Is First Entry */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('isFirstEntry')}
              className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">
              प्रथम प्रविष्ट (First Entry)
            </span>
          </label>
        </div>

        {/* Last Haridwar Year */}
        {!isFirstEntry && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              अंतिम हरिद्वार
            </label>
            <input
              type="number"
              {...register('lastHaridwarYear')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="2025"
            />
          </div>
        )}

        {/* Other Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            किसी भी अन्य स्थान पर
          </label>
          <input
            type="text"
            {...register('otherLocation')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="सुजानपुर, जम्मू, आदि"
          />
        </div>

        {/* Dikshit Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दीक्षित कब
          </label>
          <input
            type="number"
            {...register('dikshitYear')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="1995"
          />
        </div>

        {/* Dikshit By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            दीक्षित किससे
          </label>
          <input
            type="text"
            {...register('dikshitBy')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
        >
          {isLoading || isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              जोड़ा जा रहा है...
            </span>
          ) : (
            '✅ साधक जोड़ें'
          )}
        </button>
      </div>
    </form>
  );
}