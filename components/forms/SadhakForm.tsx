'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const sadhakSchema = z.object({
  placeId: z.number().min(1, 'स्थान चुनना आवश्यक है'),
  name: z.string().min(2, 'नाम आवश्यक है'),
  age: z.number().optional().nullable(),
  lastHaridwarYear: z.number().optional().nullable(),
  otherLocation: z.string().optional().nullable(),
  dikshitYear: z.number().optional().nullable(),
  dikshitBy: z.string().default('डॉ. श्री विश्वामित्र जी महाराज'),
  isFirstEntry: z.boolean().default(false),
  relationship: z.string().optional().nullable(),
  serialNumber: z.number().optional().nullable(),
});

type SadhakFormData = z.infer<typeof sadhakSchema>;

interface SadhakFormProps {
  eventId: number;
  placeId: number;
  onSuccess: () => void;
}

export default function SadhakForm({ eventId, placeId, onSuccess }: SadhakFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SadhakFormData>({
    resolver: zodResolver(sadhakSchema),
    defaultValues: {
      placeId,
      dikshitBy: 'डॉ. श्री विश्वामित्र जी महाराज',
      isFirstEntry: false,
    },
  });

  const isFirstEntry = watch('isFirstEntry');

  const onSubmit = async (data: SadhakFormData) => {
    try {
      const response = await fetch('/api/sadhaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create sadhak');

      toast.success('साधक सफलतापूर्वक जोड़ा गया');
      reset({
        placeId,
        dikshitBy: 'डॉ. श्री विश्वामित्र जी महाराज',
        isFirstEntry: false,
      });
      onSuccess();
    } catch (error) {
      toast.error('साधक जोड़ने में त्रुटि हुई');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Serial Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            क्रमांक
          </label>
          <input
            type="number"
            {...register('serialNumber', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="1, 2, 3..."
          />
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

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            संबंध
          </label>
          <input
            type="text"
            {...register('relationship')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="पति, पत्नी, आदि"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            उम्र
          </label>
          <input
            type="number"
            {...register('age', { valueAsNumber: true })}
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
              {...register('lastHaridwarYear', { valueAsNumber: true })}
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
            {...register('dikshitYear', { valueAsNumber: true })}
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
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSubmitting ? 'जोड़ा जा रहा है...' : 'साधक जोड़ें'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          रीसेट करें
        </button>
      </div>
    </form>
  );
}