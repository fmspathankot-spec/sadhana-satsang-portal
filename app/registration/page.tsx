'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus } from 'lucide-react';
import SadhakForm from '@/components/forms/SadhakForm';
import { Toaster } from 'sonner';

interface Event {
  id: number;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
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
  
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchPlaces();
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      fetchSadhaks();
    }
  }, [selectedPlace]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching places:', error);
      setLoading(false);
    }
  };

  const fetchSadhaks = async () => {
    if (!selectedPlace) return;
    
    try {
      const response = await fetch(`/api/sadhaks?placeId=${selectedPlace}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            🙏 श्री राम शरणम् 🙏
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            साधना सत्संग पंजीकरण
          </h2>
        </div>

        {/* Event Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            सत्संग कार्यक्रम चुनें
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedEvent === event.id
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{event.eventName}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.startDate)} से {formatDate(event.endDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Place Selection */}
        {selectedEvent && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              स्थान चुनें
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {places.map((place) => (
                <button
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace(place.id);
                    setShowForm(false);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPlace === place.id
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{place.name}</p>
                  {place.contactPerson && (
                    <p className="text-xs text-gray-600 mt-1">{place.contactPerson}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sadhak Entry Section */}
        {selectedPlace && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    साधक जोड़ें - {selectedPlaceData?.name}
                  </h3>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    {showForm ? 'फॉर्म बंद करें' : 'नया साधक'}
                  </button>
                </div>

                {showForm && (
                  <SadhakForm
                    eventId={selectedEvent!}
                    placeId={selectedPlace}
                    onSuccess={() => {
                      fetchSadhaks();
                      setShowForm(false);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Sadhaks List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  साधकों की सूची ({sadhaks.length})
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {sadhaks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      कोई साधक नहीं मिला
                    </p>
                  ) : (
                    sadhaks.map((sadhak) => (
                      <div
                        key={sadhak.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {sadhak.serialNumber && `${sadhak.serialNumber}. `}
                              {sadhak.name}
                              {sadhak.relationship && ` (${sadhak.relationship})`}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {sadhak.age && `उम्र: ${sadhak.age}`}
                              {sadhak.isFirstEntry && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                  प्रथम प्रविष्ट
                                </span>
                              )}
                            </p>
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