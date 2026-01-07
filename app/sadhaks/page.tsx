'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import EditSadhakModal from '@/components/modals/EditSadhakModal';

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
  placeId: number;
  placeName: string;
}

interface Place {
  id: number;
  name: string;
}

export default function SadhaksListPage() {
  const [sadhaks, setSadhaks] = useState<Sadhak[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSadhak, setEditingSadhak] = useState<Sadhak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaces();
    fetchSadhaks();
  }, [selectedPlace]);

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
    try {
      const url = selectedPlace
        ? `/api/sadhaks?placeId=${selectedPlace}`
        : '/api/sadhaks';
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
      const response = await fetch(`/api/sadhaks/${id}`, {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">
            🙏 साधकों की सूची 🙏
          </h1>
          <p className="text-gray-600">सभी साधकों का विवरण देखें, संपादित करें और प्रबंधित करें</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
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

            {/* Place Filter */}
            <select
              value={selectedPlace || ''}
              onChange={(e) => setSelectedPlace(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">सभी स्थान</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => window.open('/reports', '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                PDF
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">कुल साधक</p>
            <p className="text-3xl font-bold text-orange-600">{filteredSadhaks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">कुल स्थान</p>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(groupedByPlace).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">प्रथम प्रविष्ट</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredSadhaks.filter(s => s.isFirstEntry).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-gray-600 text-sm">औसत उम्र</p>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(
                filteredSadhaks.filter(s => s.age).reduce((sum, s) => sum + (s.age || 0), 0) /
                filteredSadhaks.filter(s => s.age).length
              ) || 0}
            </p>
          </div>
        </div>

        {/* Sadhaks List - Grouped by Place */}
        {Object.entries(groupedByPlace).map(([placeName, placeSadhaks]) => (
          <div key={placeName} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-orange-600">📍</span>
              {placeName}
              <span className="text-sm font-normal text-gray-500">
                ({placeSadhaks.length} साधक)
              </span>
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">क्रमांक</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">नाम</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">संबंध</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">उम्र</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">अंतिम हरिद्वार</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">अन्य स्थान</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">दीक्षित</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {placeSadhaks.map((sadhak) => (
                      <tr key={sadhak.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {sadhak.serialNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {sadhak.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sadhak.relationship || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sadhak.age || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sadhak.isFirstEntry ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              प्रथम प्रविष्ट
                            </span>
                          ) : (
                            sadhak.lastHaridwarYear || '-'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sadhak.otherLocation || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sadhak.dikshitYear || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSadhak(sadhak)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="संपादित करें"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(sadhak.id, sadhak.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </div>
        ))}

        {filteredSadhaks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">कोई साधक नहीं मिला</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingSadhak && (
        <EditSadhakModal
          sadhak={editingSadhak}
          onClose={() => setEditingSadhak(null)}
          onSuccess={() => {
            fetchSadhaks();
            setEditingSadhak(null);
          }}
        />
      )}
    </div>
  );
}