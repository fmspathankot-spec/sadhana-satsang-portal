'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const sadhakSchema = z.object({
  placeId: z.number().min(1, 'स्थान चुनना आवश्यक है'),
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
  serialNumber: z.coerce.number().optional().nullable(),
});

type SadhakFormData = z.infer<typeof sadhakSchema>;

interface Sadhak extends SadhakFormData {
  id: number;
}

interface EditSadhakModalProps {
  sadhak: Sadhak;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSadhakModal({ sadhak, onClose, onSuccess }: EditSadhakModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SadhakFormData>({
    resolver: zodResolver(sadhakSchema),
    defaultValues: {
      placeId: sadhak.placeId,
      placeName: sadhak.placeName || '',
      serialNumber: sadhak.serialNumber,
      name: sadhak.name,
      gender: sadhak.gender as 'male' | 'female',
      phone: sadhak.phone || '',
      age: sadhak.age,
      lastHaridwarYear: sadhak.lastHaridwarYear,
      otherLocation: sadhak.otherLocation || '',
      dikshitYear: sadhak.dikshitYear,
      dikshitBy: sadhak.dikshitBy,
      isFirstEntry: sadhak.isFirstEntry,
      relationship: sadhak.relationship || '',
    },
  });

  const isFirstEntry = watch('isFirstEntry');

  const onSubmit = async (data: SadhakFormData) => {
    setIsLoading(true);

    try {
      const cleanData = {
        ...data,
        age: data.age || null,
        phone: data.phone || null,
        lastHaridwarYear: data.lastHaridwarYear || null,
        otherLocation: data.otherLocation || null,
        dikshitYear: data.dikshitYear || null,
        relationship: data.relationship || null,
        serialNumber: data.serialNumber || null,
      };

      const response = await fetch(`/api/sadhaks/id?id=${sadhak.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        throw new Error('Failed to update sadhak');
      }

      toast.success('साधक सफलतापूर्वक अपडेट किया गया! ✅');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('अपडेट करने में त्रुटि हुई');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">साधक संपादित करें</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Serial Number Display (Read-only) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">क्रमांक (बदला नहीं जा सकता)</p>
                <p className="text-2xl font-bold text-gray-800">{sadhak.serialNumber || 'N/A'}</p>
              </div>
              <div className="text-4xl">🔢</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Place Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                स्थान <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('placeName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="पठानकोट, जम्मू, अमृतसर..."
              />
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

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isLoading ? 'अपडेट हो रहा है...' : 'अपडेट करें'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              रद्द करें
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}