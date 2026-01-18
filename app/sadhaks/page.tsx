'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, FileText } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import EditSadhakModal from '@/components/modals/EditSadhakModal';

interface Sadhak {
  id: number;
  serialNumber: number | null;
  placeName: string;
  name: string;
  gender: string | null;
  age: number | null;
  lastHaridwarYear: number | null;
  otherLocation: string | null;
  dikshitYear: number | null;
  dikshitBy: string;
  isFirstEntry: boolean;
  relationship: string | null;
  placeId: number;
  eventId: number | null;
}

interface Place {
  id: number;
  name: string;
}

interface SatsangEvent {
  id: number;
  eventName: string;
  eventType: string;
  location: string;
  startDate: string;
  endDate: string;
}

export default function SadhaksListPage() {
  const [sadhaks, setSadhaks] = useState<Sadhak[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<SatsangEvent[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSadhak, setEditingSadhak] = useState<Sadhak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaces();
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchSadhaks();
  }, [selectedPlace, selectedEvent]);

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places');
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchSadhaks = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedPlace) params.append('placeId', selectedPlace.toString());
      if (selectedEvent) params.append('eventId', selectedEvent.toString());

      const url = `/api/sadhaks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setSadhaks(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sadhaks:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`क्या आप "${name}" को हटाना चाहते हैं?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/sadhaks/id?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('साधक सफलतापूर्वक हटाया गया');
      fetchSadhaks();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('हटाने में त्रुटि हुई');
    }
  };

  const handleExportPDF = async () => {
    if (!selectedEvent) {
      toast.error('कृपया पहले सत्संग चुनें');
      return;
    }

    const selectedEventData = events.find(e => e.id === selectedEvent);
    if (!selectedEventData) return;

    try {
      toast.loading('PDF तैयार हो रही है...');
      
      // Fetch HTML from API
      const response = await fetch(`/api/export/pdf?eventId=${selectedEvent}`);
      if (!response.ok) throw new Error('Export failed');
      const htmlContent = await response.text();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('कृपया पॉप-अप को अनुमति दें');
        return;
      }

      // Write HTML content
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        // Trigger print dialog
        printWindow.print();
        
        // Close window after printing (user can cancel)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

      toast.dismiss();
      toast.success('प्रिंट डायलॉग खुल गया है। "Save as PDF" चुनें।');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('एक्सपोर्ट में त्रुटि हुई');
    }
  };

  const handleExportCSV = async () => {
    if (!selectedEvent) {
      toast.error('कृपया पहले सत्संग चुनें');
      return;
    }

    const selectedEventData = events.find(e => e.id === selectedEvent);
    if (!selectedEventData) return;

    try {
      const response = await fetch(`/api/export/csv?eventId=${selectedEvent}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Generate filename: location-date.csv
      const startDate = new Date(selectedEventData.startDate);
      const dateStr = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
      a.download = `${selectedEventData.location}-${dateStr}.csv`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('CSV फ़ाइल डाउनलोड हो रही है');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('एक्सपोर्ट में त्रुटि हुई');
    }
  };

  const filteredSadhaks = sadhaks.filter((sadhak) =>
    sadhak.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByPlace = filteredSadhaks.reduce((acc, sadhak) => {
    const placeName = sadhak.placeName || 'Unknown';
    if (!acc[placeName]) {
      acc[placeName] = [];
    }
    acc[placeName].push(sadhak);
    return acc;
  }, {} as Record<string, Sadhak[]>);

  // Sort sadhaks by serial number within each place
  Object.keys(groupedByPlace).forEach((placeName) => {
    groupedByPlace[placeName].sort((a, b) => 
      (a.serialNumber || 0) - (b.serialNumber || 0)
    );
  });

  const selectedEventData = events.find(e => e.id === selectedEvent);

  // Calculate statistics
  const totalSadhaks = filteredSadhaks.length;
  const totalPlaces = Object.keys(groupedByPlace).length;
  const maleCount = filteredSadhaks.filter(s => s.gender === 'male').length;
  const femaleCount = filteredSadhaks.filter(s => s.gender === 'female').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          👥 साधकों की सूची
        </h1>
        <p className="text-gray-600">सभी साधकों का विवरण देखें, संपादित करें और प्रबंधित करें</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Event Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              सत्संग चुनें <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEvent || ''}
              onChange={(e) => setSelectedEvent(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">सभी सत्संग</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName} - {event.location}
                </option>
              ))}
            </select>
          </div>

          {/* Place Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              स्थान फ़िल्टर
            </label>
            <select
              value={selectedPlace || ''}
              onChange={(e) => setSelectedPlace(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">सभी स्थान</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              नाम से खोजें
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="नाम से खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              एक्सपोर्ट
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                disabled={!selectedEvent}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                title="PDF डाउनलोड करें"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!selectedEvent}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Banner */}
      {selectedEventData && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedEventData.eventName}</h2>
              <p className="text-orange-100">
                📍 {selectedEventData.location} | 📅{' '}
                {new Date(selectedEventData.startDate).toLocaleDateString('hi-IN')} -{' '}
                {new Date(selectedEventData.endDate).toLocaleDateString('hi-IN')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalSadhaks}</div>
              <div className="text-orange-100">कुल साधक</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {selectedEvent && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">{totalSadhaks}</div>
            <div className="text-sm text-gray-600">कुल साधक</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{totalPlaces}</div>
            <div className="text-sm text-gray-600">कुल स्थान</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{maleCount}</div>
            <div className="text-sm text-gray-600">पुरुष</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-pink-600">{femaleCount}</div>
            <div className="text-sm text-gray-600">महिला</div>
          </div>
        </div>
      )}

      {/* Sadhaks List */}
      {Object.keys(groupedByPlace).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">कोई साधक नहीं मिला</h3>
          <p className="text-gray-600">
            {selectedEvent 
              ? 'इस सत्संग के लिए अभी तक कोई साधक पंजीकृत नहीं हुआ है।'
              : 'कृपया सत्संग चुनें।'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByPlace).map(([placeName, sadhaksList]) => (
            <div key={placeName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Place Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center justify-between">
                  <span>📍 {placeName}</span>
                  <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                    {sadhaksList.length} साधक
                  </span>
                </h3>
              </div>

              {/* Sadhaks Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        क्रमांक
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        नाम
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        लिंग
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        उम्र
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        अंतिम हरिद्वार
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        अन्य स्थान
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        दीक्षित
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        कार्रवाई
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sadhaksList.map((sadhak) => (
                      <tr key={sadhak.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.serialNumber || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{sadhak.name}</div>
                          {sadhak.relationship && (
                            <div className="text-xs text-gray-500">({sadhak.relationship})</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.gender === 'male' ? '👨 पुरुष' : sadhak.gender === 'female' ? '👩 महिला' : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.age || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.isFirstEntry ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              प्रथम प्रविष्ट
                            </span>
                          ) : (
                            sadhak.lastHaridwarYear || '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.otherLocation || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.dikshitYear && `${sadhak.dikshitYear} - `}
                          {sadhak.dikshitBy}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSadhak(sadhak)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="संपादित करें"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sadhak.id, sadhak.name)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="हटाएं"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingSadhak && (
        <EditSadhakModal
          sadhak={editingSadhak}
          onClose={() => setEditingSadhak(null)}
          onSuccess={() => {
            setEditingSadhak(null);
            fetchSadhaks();
          }}
        />
      )}

      <Toaster position="top-right" richColors />
    </div>
  );
}