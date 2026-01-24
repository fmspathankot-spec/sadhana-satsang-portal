'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Plus, ChevronRight, Check, CheckCircle, XCircle, Filter } from 'lucide-react';
import SadhakForm from '@/components/forms/SadhakForm';
import { Toaster, toast } from 'sonner';

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
  isApproved: boolean;
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
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'approved' | 'pending'>('all');

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
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places');
      const data = await response.json();
      console.log('Fetched places:', data);
      setPlaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching places:', error);
      setPlaces([]);
    }
  };

  const fetchSadhaks = async () => {
    if (!selectedEvent) return;
    
    try {
      const response = await fetch(`/api/sadhaks?eventId=${selectedEvent}`);
      const data = await response.json();
      setSadhaks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sadhaks:', error);
      setSadhaks([]);
    }
  };

  const handleApprove = async (sadhakId: number, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/sadhaks-approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sadhakId, isApproved }),
      });

      if (!response.ok) throw new Error('Failed to update approval');

      // Update local state
      setSadhaks(sadhaks.map(s => 
        s.id === sadhakId ? { ...s, isApproved } : s
      ));

      setTimeout(() => {
        toast.success(isApproved ? 'साधक स्वीकृत किया गया ✅' : 'साधक अस्वीकृत किया गया ❌');
      }, 0);
    } catch (error) {
      console.error('Error updating approval:', error);
      setTimeout(() => {
        toast.error('अनुमोदन अपडेट करने में त्रुटि');
      }, 0);
    }
  };

  // Memoize the onSuccess callback to avoid re-creating it on every render
  const handleSadhakSuccess = useCallback(() => {
    fetchSadhaks();
    setShowForm(false);
  }, [selectedEvent]);

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const selectedPlaceData = Array.isArray(places) ? places.find(p => p.id === selectedPlace) : undefined;

  // Filter sadhaks based on approval status
  const filteredSadhaks = sadhaks.filter(sadhak => {
    if (approvalFilter === 'all') return true;
    if (approvalFilter === 'approved') return sadhak.isApproved;
    if (approvalFilter === 'pending') return !sadhak.isApproved;
    return true;
  });

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8">
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

        {/* Step 1: Event Type Selection */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              सत्संग का प्रकार चुनें
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSelectedEventType('sadhana');
                  setCurrentStep(2);
                }}
                className="p-6 border-2 border-orange-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-all text-left group"
              >
                <Calendar className="w-12 h-12 text-orange-600 mb-3" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  साधना सत्संग
                </h4>
                <p className="text-gray-600">
                  नियमित साधना सत्संग के लिए पंजीकरण
                </p>
              </button>

              <button
                onClick={() => {
                  setSelectedEventType('special');
                  setCurrentStep(2);
                }}
                className="p-6 border-2 border-orange-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-all text-left group"
              >
                <MapPin className="w-12 h-12 text-orange-600 mb-3" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  विशेष सत्संग
                </h4>
                <p className="text-gray-600">
                  विशेष आयोजन के लिए पंजीकरण
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Event Selection */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                सत्संग चुनें
              </h3>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedEventType(null);
                  setSelectedEvent(null);
                }}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                ← वापस जाएं
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  कोई सत्संग उपलब्ध नहीं है
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event.id);
                      setCurrentStep(3);
                    }}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-all text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {event.eventName}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(event.startDate)} - {formatDate(event.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {event.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Sadhak Management */}
        {currentStep === 3 && selectedEvent && (
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedEventData?.eventName}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {selectedEventData && formatDate(selectedEventData.startDate)} - {selectedEventData && formatDate(selectedEventData.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEventData?.location}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentStep(2);
                    setSelectedEvent(null);
                    setSadhaks([]);
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  ← वापस जाएं
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">फ़िल्टर:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setApprovalFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      approvalFilter === 'all'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    सभी ({sadhaks.length})
                  </button>
                  <button
                    onClick={() => setApprovalFilter('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      approvalFilter === 'approved'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    स्वीकृत ({sadhaks.filter(s => s.isApproved).length})
                  </button>
                  <button
                    onClick={() => setApprovalFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      approvalFilter === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    लंबित ({sadhaks.filter(s => !s.isApproved).length})
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                नया साधक जोड़ें
              </button>
            </div>

            {/* Sadhak Form */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    साधक की जानकारी दर्ज करें
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                <SadhakForm
                  eventId={selectedEvent}
                  placeId={selectedPlace || 0}
                  onSuccess={handleSadhakSuccess}
                />
              </div>
            )}

            {/* Sadhaks List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                पंजीकृत साधक ({filteredSadhaks.length})
              </h3>

              {filteredSadhaks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {approvalFilter === 'all' 
                      ? 'अभी तक कोई साधक पंजीकृत नहीं है'
                      : approvalFilter === 'approved'
                      ? 'कोई स्वीकृत साधक नहीं है'
                      : 'कोई लंबित साधक नहीं है'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          क्रमांक
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          नाम
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          स्थान
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          फोन
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          उम्र
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          स्थिति
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          कार्रवाई
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSadhaks.map((sadhak, index) => (
                        <tr key={sadhak.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {sadhak.serialNumber || index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {sadhak.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sadhak.placeName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sadhak.phone || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sadhak.age || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {sadhak.isApproved ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <CheckCircle className="w-4 h-4" />
                                स्वीकृत
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                <XCircle className="w-4 h-4" />
                                लंबित
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {!sadhak.isApproved && (
                                <button
                                  onClick={() => handleApprove(sadhak.id, true)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                >
                                  स्वीकृत करें
                                </button>
                              )}
                              {sadhak.isApproved && (
                                <button
                                  onClick={() => handleApprove(sadhak.id, false)}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                                >
                                  अस्वीकृत करें
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}