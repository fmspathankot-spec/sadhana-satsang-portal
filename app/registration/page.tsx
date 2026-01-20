'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, ChevronRight, Check } from 'lucide-react';
import SadhakForm from '@/components/forms/SadhakForm';
import { Toaster } from 'sonner';

interface Event {
  id: number;
  eventType: string;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  isActive: boolean;
}

interface Place {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
}

interface Sadhak {
  id: number;
  serialNumber: number | null;
  name: string;
  phone: string | null;
  age: number | null;
  lastHaridwarYear: number | null;
  otherLocation: string | null;
  dikshitYear: number | null;
  dikshitBy: string;
  isFirstEntry: boolean;
  relationship: string | null;
  placeName: string;
}

export default function EventRegistrationPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [sadhaks, setSadhaks] = useState<Sadhak[]>([]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaces();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedEventType) {
      fetchEvents(selectedEventType);
    }
  }, [selectedEventType]);

  useEffect(() => {
    if (selectedEvent) {
      fetchSadhaks();
    }
  }, [selectedEvent]);

  const fetchEvents = async (eventType: string) => {
    try {
      const response = await fetch(`/api/events?eventType=${eventType}`);
      const data = await response.json();
      console.log('Fetched events:', data);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const fetchSadhaks = async () => {
    if (!selectedEvent) return;
    
    try {
      const response = await fetch(`/api/sadhaks?eventId=${selectedEvent}`);
      const data = await response.json();
      setSadhaks(data);
    } catch (error) {
      console.error('Error fetching sadhaks:', error);
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const selectedPlaceData = places.find(p => p.id === selectedPlace);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleEventTypeSelect = (type: string) => {
    setSelectedEventType(type);
    setCurrentStep(2);
    setSelectedEvent(null);
    setSelectedPlace(null);
    setShowForm(false);
  };

  const handleEventSelect = (eventId: number) => {
    setSelectedEvent(eventId);
    // Skip place selection for Sadhna/Khula - go directly to form
    setCurrentStep(3);
    setShowForm(false);
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedEvent(null);
      setShowForm(false);
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedEventType(null);
      setSelectedEvent(null);
      setShowForm(false);
    }
  };

  const getEventTypeLabel = (type: string) => {
    return type === 'sadhna' ? 'साधना सत्संग' : 'खुले सत्संग';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-orange-600 mb-2">
            🙏 श्री राम शरणम् 🙏
          </h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">
            साधना सत्संग पंजीकरण
          </h2>
          <p className="text-gray-600">
            सत्संग का प्रकार चुनें → सत्संग चुनें → साधक जोड़ें
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 md:gap-4 min-w-max px-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${
                currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : '1'}
              </div>
              <span className="ml-2 font-medium text-gray-700 text-sm md:text-base">प्रकार</span>
            </div>

            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${
                currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {currentStep > 2 ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : '2'}
              </div>
              <span className="ml-2 font-medium text-gray-700 text-sm md:text-base">सत्संग</span>
            </div>

            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />

            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${
                currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium text-gray-700 text-sm md:text-base">साधक</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        {currentStep > 1 && (
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2"
            >
              ← पीछे जाएं
            </button>
          </div>
        )}

        {/* Step 1: Event Type Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              सत्संग का प्रकार चुनें
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Sadhna Satsang */}
              <button
                onClick={() => handleEventTypeSelect('sadhna')}
                className="group p-8 rounded-xl border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all bg-gradient-to-br from-orange-50 to-white"
              >
                <div className="text-6xl mb-4">🕉️</div>
                <h4 className="font-bold text-2xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  साधना सत्संग
                </h4>
                <p className="text-gray-600 mb-4">
                  नियमित साधना सत्संग कार्यक्रम
                </p>
                <div className="text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                  चुनें →
                </div>
              </button>

              {/* Khula Satsang */}
              <button
                onClick={() => handleEventTypeSelect('khula')}
                className="group p-8 rounded-xl border-2 border-gray-200 hover:border-orange-600 hover:shadow-2xl transition-all bg-gradient-to-br from-blue-50 to-white"
              >
                <div className="text-6xl mb-4">🙏</div>
                <h4 className="font-bold text-2xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  खुले सत्संग
                </h4>
                <p className="text-gray-600 mb-4">
                  खुले सत्संग कार्यक्रम
                </p>
                <div className="text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                  चुनें →
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Event Selection */}
        {currentStep === 2 && selectedEventType && (
          <div className="space-y-6">
            {/* Selected Type Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">चयनित प्रकार:</p>
                  <h3 className="text-xl font-bold text-orange-600">
                    {selectedEventType === 'sadhna' ? '🕉️ साधना सत्संग' : '🙏 खुले सत्संग'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Event Selection */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                सत्संग कार्यक्रम चुनें
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className="group p-6 rounded-xl border-2 border-gray-200 hover:border-orange-600 hover:shadow-xl transition-all text-left bg-white"
                  >
                    <h4 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                      {event.eventName}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <span className="text-sm">
                          {formatDate(event.startDate)} से {formatDate(event.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5 text-orange-600" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-orange-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                      चुनें →
                    </div>
                  </button>
                ))}
              </div>
              {events.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  इस प्रकार का कोई सत्संग उपलब्ध नहीं है
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Sadhak Entry (No Place Selection) */}
        {currentStep === 3 && selectedEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                {/* Selected Info */}
                <div className="mb-6 p-4 bg-orange-50 rounded-lg space-y-1">
                  <p className="text-sm text-gray-600">
                    <strong>प्रकार:</strong> {selectedEventType === 'sadhna' ? '🕉️ साधना सत्संग' : '🙏 खुले सत्संग'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>सत्संग:</strong> {selectedEventData?.eventName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>स्थान:</strong> {selectedEventData?.location}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    साधक जोड़ें
                  </h3>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    {showForm ? 'फॉर्म बंद करें' : 'नया साधक'}
                  </button>
                </div>

                {showForm && (
                  <SadhakForm
                    eventId={selectedEvent}
                    placeId={1} // Dummy placeId since we're not using it
                    onSuccess={() => {
                      fetchSadhaks();
                      setShowForm(false);
                    }}
                  />
                )}

                {!showForm && sadhaks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-4">अभी तक कोई साधक नहीं जोड़ा गया</p>
                    <p className="text-sm">ऊपर "नया साधक" बटन पर क्लिक करें</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sadhaks List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  साधकों की सूची ({sadhaks.length})
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {sadhaks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">
                      कोई साधक नहीं मिला
                    </p>
                  ) : (
                    sadhaks.map((sadhak) => (
                      <div
                        key={sadhak.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {sadhak.serialNumber && `${sadhak.serialNumber}. `}
                              {sadhak.name}
                              {sadhak.relationship && ` (${sadhak.relationship})`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {sadhak.placeName}
                            </p>
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              {sadhak.age && <p>उम्र: {sadhak.age}</p>}
                              {sadhak.phone && <p>📞 {sadhak.phone}</p>}
                              {sadhak.isFirstEntry && (
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                  प्रथम प्रविष्ट
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}