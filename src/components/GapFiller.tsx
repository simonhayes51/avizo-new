import { useState } from 'react';
import { X, Clock, Calendar, User, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Appointment, Client } from '../types';

interface GapFillerProps {
  gap: Appointment;
  clients: Client[];
  onClose: () => void;
  onFilled: () => void;
}

export default function GapFiller({ gap, clients, onClose, onFilled }: GapFillerProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fillGap = async () => {
    if (!selectedClientId || !title) return;

    setLoading(true);

    const { error } = await supabase
      .from('appointments')
      .update({
        client_id: selectedClientId,
        title,
        location,
        notes,
        is_gap: false,
        status: 'scheduled',
      })
      .eq('id', gap.id);

    setLoading(false);

    if (error) {
      console.error('Error filling gap:', error);
      return;
    }

    onFilled();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Fill Gap</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-900 mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                {formatTime(gap.start_time)} - {formatTime(gap.end_time)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(gap.start_time).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Client *
            </label>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            />
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
              {filteredClients.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No clients found</div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full p-3 flex items-center justify-between hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors ${
                      selectedClientId === client.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-slate-900">{client.name}</div>
                        <div className="text-sm text-slate-500">{client.phone_number}</div>
                      </div>
                    </div>
                    {selectedClientId === client.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Appointment Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Driving Lesson, Haircut"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., 123 High Street, Pickup point"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={fillGap}
            disabled={!selectedClientId || !title || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Booking...' : 'Fill Gap'}
          </button>
        </div>
      </div>
    </div>
  );
}
