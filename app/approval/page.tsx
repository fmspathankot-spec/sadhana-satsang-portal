'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Download, Filter, Users } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Event {
  id: number;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
}

interface Sadhak {
  id: number;
  serialNumber: number | null;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string;
  placeName: string;
  isApproved: boolean;
  relationship: string | null;
}

export default function ApprovalPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [sadhaks, setSadhaks] = useState<Sadhak[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchSadhaks();
    }
  }, [selectedEvent]);

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
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sadhaks?eventId=${selectedEvent}`);
      const data = await response.json();
      setSadhaks(data);
    } catch (error) {
      console.error('Error fetching sadhaks:', error);
      toast.error('साधक लोड करने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sadhakId: number, isApproved: boolean) => {
    try {
      const response = await fetch('/api/sadhaks-approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sadhakId, isApproved }),
      });

      if (!response.ok) throw new Error('Failed to update approval');

      setSadhaks(sadhaks.map(s => 
        s.id === sadhakId ? { ...s, isApproved } : s
      ));

      toast.success(isApproved ? '✅ स्वीकृत किया गया' : '❌ अस्वीकृत किया गया');
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('अनुमोदन अपडेट करने में त्रुटि');
    }
  };

  const handleBulkApprove = async (isApproved: boolean) => {
    if (selectedIds.length === 0) {
      toast.error('कृपया साधक चुनें');
      return;
    }

    try {
      const response = await fetch('/api/sadhaks/bulk-approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, isApproved }),
      });

      if (!response.ok) throw new Error('Failed to bulk update');

      setSadhaks(sadhaks.map(s => 
        selectedIds.includes(s.id) ? { ...s, isApproved } : s
      ));

      setSelectedIds([]);
      toast.success(`${selectedIds.length} साधक ${isApproved ? 'स्वीकृत' : 'अस्वीकृत'} किए गए`);
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('बल्क अपडेट में त्रुटि');
    }
  };

  const handleExportPDF = () => {
    if (!selectedEvent) {
      toast.error('कृपया सत्संग चुनें');
      return;
    }

    // Navigate to approved list page with selected event
    window.open(`/approved-list?eventId=${selectedEvent}`, '_blank');
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSadhaks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSadhaks.map(s => s.id));
    }
  };

  const filteredSadhaks = sadhaks.filter(sadhak => {
    if (filter === 'all') return true;
    if (filter === 'approved') return sadhak.isApproved;
    if (filter === 'pending') return !sadhak.isApproved;
    return true;
  });

  const stats = {
    total: sadhaks.length,
    approved: sadhaks.filter(s => s.isApproved).length,
    pending: sadhaks.filter(s => !s.isApproved).length,
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-blue-600 mb-2">
            ✅ अनुमोदन प्रबंधन
          </h1>
          <p className="text-gray-600">
            Approval Management - Approve or Reject Sadhaks
          </p>
        </div>

        {/* Event Selection & Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Selector */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                सत्संग चुनें
              </label>
              <select
                value={selectedEvent || ''}
                onChange={(e) => {
                  setSelectedEvent(Number(e.target.value));
                  setSelectedIds([]);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">सत्संग चुनें</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName} ({formatDate(event.startDate)} - {formatDate(event.endDate)})
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={handleExportPDF}
                disabled={!selectedEvent || stats.approved === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                PDF Export ({stats.approved})
              </button>
            </div>
          </div>

          {/* Stats */}
          {selectedEvent && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">कुल साधक</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                <p className="text-sm text-green-600">स्वीकृत</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <XCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                <p className="text-sm text-yellow-600">लंबित</p>
              </div>
            </div>
          )}
        </div>

        {/* Sadhaks List */}
        {selectedEvent && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Filter & Bulk Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  सभी ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'approved'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  स्वीकृत ({stats.approved})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  लंबित ({stats.pending})
                </button>
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                    {selectedIds.length} चयनित
                  </span>
                  <button
                    onClick={() => handleBulkApprove(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    सभी स्वीकृत करें
                  </button>
                  <button
                    onClick={() => handleBulkApprove(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    सभी अस्वीकृत करें
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading...</p>
              </div>
            ) : filteredSadhaks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">कोई साधक नहीं मिला</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-100 border-b-2 border-blue-200">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredSadhaks.length}
                          onChange={toggleSelectAll}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-bold">क्रमांक</th>
                      <th className="px-4 py-3 text-left font-bold">नाम</th>
                      <th className="px-4 py-3 text-left font-bold">स्थान</th>
                      <th className="px-4 py-3 text-left font-bold">उम्र</th>
                      <th className="px-4 py-3 text-left font-bold">मोबाइल</th>
                      <th className="px-4 py-3 text-left font-bold">लिंग</th>
                      <th className="px-4 py-3 text-left font-bold">स्थिति</th>
                      <th className="px-4 py-3 text-left font-bold">कार्रवाई</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSadhaks.map((sadhak, index) => (
                      <tr
                        key={sadhak.id}
                        className={`border-b hover:bg-blue-50 transition-colors ${
                          sadhak.isApproved ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(sadhak.id)}
                            onChange={() => toggleSelection(sadhak.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">
                          {sadhak.name}
                          {sadhak.relationship && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({sadhak.relationship})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{sadhak.placeName}</td>
                        <td className="px-4 py-3">{sadhak.age || '-'}</td>
                        <td className="px-4 py-3 text-sm">{sadhak.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sadhak.gender === 'female'
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {sadhak.gender === 'female' ? 'महिला' : 'पुरुष'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sadhak.isApproved ? (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <CheckCircle className="w-4 h-4" />
                              स्वीकृत
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                              <XCircle className="w-4 h-4" />
                              लंबित
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {!sadhak.isApproved ? (
                            <button
                              onClick={() => handleApprove(sadhak.id, true)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              स्वीकृत करें
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprove(sadhak.id, false)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              अस्वीकृत करें
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}