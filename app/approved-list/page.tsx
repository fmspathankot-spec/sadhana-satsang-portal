'use client';

import { useState, useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
}

export default function ApprovedListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [sadhaks, setSadhaks] = useState<Sadhak[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    
    // Check for eventId in URL params
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');
    if (eventId) {
      setSelectedEvent(Number(eventId));
    }
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchApprovedSadhaks();
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

  const fetchApprovedSadhaks = async () => {
    if (!selectedEvent) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sadhaks?eventId=${selectedEvent}`);
      const data = await response.json();
      
      // Filter only approved sadhaks
      const approved = data.filter((s: Sadhak) => s.isApproved);
      setSadhaks(approved);
    } catch (error) {
      console.error('Error fetching approved sadhaks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group sadhaks by place and gender
  const groupedSadhaks = sadhaks.reduce((acc, sadhak) => {
    const place = sadhak.placeName;
    if (!acc[place]) {
      acc[place] = { male: [], female: [] };
    }
    
    if (sadhak.gender === 'male') {
      acc[place].male.push(sadhak);
    } else if (sadhak.gender === 'female') {
      acc[place].female.push(sadhak);
    }
    
    return acc;
  }, {} as Record<string, { male: Sadhak[]; female: Sadhak[] }>);

  const selectedEventData = events.find(e => e.id === selectedEvent);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('hi-IN', { month: 'long' });
    return `${day} ${month}`;
  };

  const formatDateRange = () => {
    if (!selectedEventData) return '';
    const start = formatDate(selectedEventData.startDate);
    const end = formatDate(selectedEventData.endDate);
    return `${start} - ${end}`;
  };

  const generatePDF = () => {
    if (!selectedEventData) return;

    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = `${selectedEventData.location} Sadhana Satsang ${formatDateRange()} ke liye Swikrit Namon ki Suchi`;
    doc.text(title, 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Process each place
    Object.entries(groupedSadhaks).forEach(([place, { male, female }]) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Place heading
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${place} (${formatDateRange()})`, 105, yPosition, { align: 'center' });
      yPosition += 10;

      // Ladies section
      if (female.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Mahilayen (Ladies)', 14, yPosition);
        yPosition += 5;

        const femaleData = female.map((s, idx) => [
          idx + 1,
          s.name,
          s.age || '-',
          s.phone || '-'
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Kramank', 'Naam', 'Umra', 'Mobile Number']],
          body: femaleData,
          theme: 'grid',
          headStyles: { fillColor: [255, 192, 203], textColor: [0, 0, 0], fontStyle: 'bold' },
          styles: { font: 'helvetica', fontSize: 10 },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }

      // Gents section
      if (male.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Purush (Gents)', 14, yPosition);
        yPosition += 5;

        const maleData = male.map((s, idx) => [
          idx + 1,
          s.name,
          s.age || '-',
          s.phone || '-'
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [['Kramank', 'Naam', 'Umra', 'Mobile Number']],
          body: maleData,
          theme: 'grid',
          headStyles: { fillColor: [173, 216, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
          styles: { font: 'helvetica', fontSize: 10 },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    });

    // Save PDF
    const filename = `Approved_List_${selectedEventData.eventName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-green-600 mb-2">
            ✅ स्वीकृत नामों की सूची
          </h1>
          <p className="text-gray-600">
            Approved Sadhaks List - Gender-wise Separated
          </p>
        </div>

        {/* Event Selection */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                सत्संग चुनें
              </label>
              <select
                value={selectedEvent || ''}
                onChange={(e) => setSelectedEvent(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">सत्संग चुनें</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName} ({formatDate(event.startDate)} - {formatDate(event.endDate)})
                  </option>
                ))}
              </select>
            </div>
            {selectedEvent && sadhaks.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={generatePDF}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <Download className="w-5 h-5" />
                  PDF Download
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Printer className="w-5 h-5" />
                  Print
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading approved sadhaks...</p>
          </div>
        )}

        {/* Approved Lists by Place */}
        {!loading && selectedEvent && (
          <div className="space-y-8 print:space-y-12">
            {Object.keys(groupedSadhaks).length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg">
                  इस सत्संग के लिए कोई स्वीकृत साधक नहीं मिला
                </p>
              </div>
            ) : (
              Object.entries(groupedSadhaks).map(([place, { male, female }]) => (
                <div key={place} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 print:break-inside-avoid">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center border-b-2 border-green-600 pb-4">
                    {place} ({formatDateRange()})
                  </h2>

                  {/* Ladies Section */}
                  {female.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-2xl font-bold text-pink-600 mb-4">
                        महिलाएं (Ladies)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border-2 border-gray-300">
                          <thead>
                            <tr className="bg-pink-100">
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                क्रमांक
                              </th>
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                नाम
                              </th>
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                उम्र
                              </th>
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                मोबाइल नंबर
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {female.map((sadhak, index) => (
                              <tr key={sadhak.id} className="hover:bg-pink-50">
                                <td className="border-2 border-gray-300 px-4 py-3">
                                  {index + 1}
                                </td>
                                <td className="border-2 border-gray-300 px-4 py-3 font-medium">
                                  {sadhak.name}
                                </td>
                                <td className="border-2 border-gray-300 px-4 py-3">
                                  {sadhak.age || '-'}
                                </td>
                                <td className="border-2 border-gray-300 px-4 py-3">
                                  {sadhak.phone || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Gents Section */}
                  {male.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-blue-600 mb-4">
                        पुरुष (Gents)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border-2 border-gray-300">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                क्रमांक
                              </th>
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                नाम
                              </th>
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                उम्र
                              </th>
                              <th className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                                मोबाइल नंबर
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {male.map((sadhak, index) => (
                              <tr key={sadhak.id} className="hover:bg-blue-50">
                                <td className="border-2 border-gray-300 px-4 py-3">
                                  {index + 1}
                                </td>
                                <td className="border-2 border-gray-300 px-4 py-3 font-medium">
                                  {sadhak.name}
                                </td>
                                <td className="border-2 border-gray-300 px-4 py-3">
                                  {sadhak.age || '-'}
                                </td>
                                <td className="border-2 border-gray-300 px-4 py-3">
                                  {sadhak.phone || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:space-y-12 > * + * {
            margin-top: 3rem;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}