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
  phone?: string | null;
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
      
      // Sort events: Sadhna first (by date DESC), then Khule Satsang (by date DESC)
      const sortedEvents = data.sort((a: SatsangEvent, b: SatsangEvent) => {
        // First sort by event type (sadhna before khule_satsang)
        if (a.eventType === 'sadhna' && b.eventType !== 'sadhna') return -1;
        if (a.eventType !== 'sadhna' && b.eventType === 'sadhna') return 1;
        
        // Within same type, sort by start date (newest/latest first)
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateB - dateA; // Descending order (latest first)
      });
      
      setEvents(sortedEvents);
      
      // Auto-select the most recent event (first in sorted list - latest date)
      if (sortedEvents.length > 0 && !selectedEvent) {
        const mostRecentEvent = sortedEvents[0];
        setSelectedEvent(mostRecentEvent.id);
        console.log('Auto-selected most recent event:', mostRecentEvent.eventName, mostRecentEvent.startDate);
      }
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

  const handleEdit = (sadhak: Sadhak) => {
    setEditingSadhak(sadhak);
  };

  const handleEditSuccess = () => {
    setEditingSadhak(null);
    fetchSadhaks();
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
      
      // Generate filename: location-date.pdf
      const startDate = new Date(selectedEventData.startDate);
      const dateStr = `${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}`;
      const filename = `${selectedEventData.location}-${dateStr}.pdf`;
      
      // Create iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        toast.error('PDF तैयार करने में त्रुटि');
        return;
      }

      // Write HTML content with title for filename
      iframeDoc.open();
      iframeDoc.write(htmlContent.replace('<title>साधकों की सूची</title>', `<title>${filename}</title>`));
      iframeDoc.close();

      // Wait for content to load
      iframe.onload = () => {
        setTimeout(() => {
          try {
            // Trigger print dialog
            iframe.contentWindow?.print();
            
            // Remove iframe after a delay
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
            
            toast.dismiss();
            toast.success('प्रिंट डायलॉग खुल गया है। "Save as PDF" चुनें।');
          } catch (error) {
            console.error('Print error:', error);
            toast.dismiss();
            toast.error('प्रिंट करने में त्रुटि');
            document.body.removeChild(iframe);
          }
        }, 500);
      };
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

  // Filter sadhaks based on search term
  const filteredSadhaks = sadhaks.filter((sadhak) =>
    sadhak.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group sadhaks by place
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
      <Toaster position="top-center" richColors />
      
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
              {events.map((event) => {
                const startDate = new Date(event.startDate);
                const formattedDate = startDate.toLocaleDateString('hi-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                
                return (
                  <option key={event.id} value={event.id}>
                    {event.eventType === 'sadhna' ? '🧘 साधना' : '🙏 खुला'} - {event.location} - {formattedDate}
                  </option>
                );
              })}
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
              निर्यात करें
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">कुल साधक</div>
          <div className="text-3xl font-bold text-orange-600">{totalSadhaks}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">कुल स्थान</div>
          <div className="text-3xl font-bold text-blue-600">{totalPlaces}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">पुरुष</div>
          <div className="text-3xl font-bold text-green-600">{maleCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">महिला</div>
          <div className="text-3xl font-bold text-pink-600">{femaleCount}</div>
        </div>
      </div>

      {/* Selected Event Info */}
      {selectedEventData && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-orange-900">{selectedEventData.eventName}</h3>
              <p className="text-sm text-orange-700">
                {selectedEventData.location} • {new Date(selectedEventData.startDate).toLocaleDateString('hi-IN')} - {new Date(selectedEventData.endDate).toLocaleDateString('hi-IN')}
              </p>
            </div>
            <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-medium">
              {selectedEventData.eventType === 'sadhna' ? 'साधना सत्संग' : 'खुला सत्संग'}
            </span>
          </div>
        </div>
      )}

      {/* Sadhaks List */}
      {filteredSadhaks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">कोई साधक नहीं मिला</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByPlace).map(([placeName, placeSadhaks]) => (
            <div key={placeName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Place Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    📍 {placeName}
                  </h3>
                  <span className="px-3 py-1 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium">
                    {placeSadhaks.length} साधक
                  </span>
                </div>
              </div>

              {/* Sadhaks Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        क्रमांक
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        नाम
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        लिंग
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        उम्र
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        फोन
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        दीक्षित वर्ष
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        कार्रवाई
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {placeSadhaks.map((sadhak) => (
                      <tr key={sadhak.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sadhak.serialNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sadhak.name}</div>
                          {sadhak.relationship && (
                            <div className="text-xs text-gray-500">{sadhak.relationship}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sadhak.gender === 'male' ? '👨 पुरुष' : sadhak.gender === 'female' ? '👩 महिला' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sadhak.age || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sadhak.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sadhak.dikshitYear || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(sadhak)}
                              className="text-blue-600 hover:text-blue-900"
                              title="संपादित करें"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(sadhak.id, sadhak.name)}
                              className="text-red-600 hover:text-red-900"
                              title="हटाएं"
                            >
                              <Trash2 className="w-5 h-5" />
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
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}