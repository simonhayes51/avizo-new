import { useState, useEffect } from 'react';
import { Clock, MapPin, User, AlertCircle, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Appointment, Client } from '../types';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFillGapModal, setShowFillGapModal] = useState(false);
  const [selectedGap, setSelectedGap] = useState<Appointment | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const [appointmentsData, clientsData] = await Promise.all([
        api.appointments.getAll({
          date: selectedDate.toISOString().split('T')[0],
        }),
        api.clients.getAll()
      ]);

      setAppointments(appointmentsData || []);
      setClients(clientsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setAppointments([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFillGap = (gap: Appointment) => {
    setSelectedGap(gap);
    setShowFillGapModal(true);
  };

  const handleAddAppointment = () => {
    setShowAddModal(true);
  };

  const gaps = appointments.filter((apt) => apt.is_gap);
  const scheduled = appointments.filter((apt) => !apt.is_gap && apt.status === 'scheduled');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Loading today's schedule...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {scheduled.length} appointment{scheduled.length !== 1 ? 's' : ''} today
          {gaps.length > 0 && ` · ${gaps.length} gap${gaps.length !== 1 ? 's' : ''} to fill`}
        </p>
      </div>

      {gaps.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Available Slots</h3>
              <p className="text-sm text-amber-700 mt-1">
                You have {gaps.length} gap{gaps.length !== 1 ? 's' : ''} in your schedule today. These can be filled quickly.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No appointments scheduled for today</p>
            <button
              onClick={handleAddAppointment}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Appointment</span>
            </button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onFillGap={handleFillGap}
            />
          ))
        )}
      </div>

      {showAddModal && (
        <AddAppointmentModal
          clients={clients}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}

      {showFillGapModal && selectedGap && (
        <FillGapModal
          gap={selectedGap}
          clients={clients}
          onClose={() => {
            setShowFillGapModal(false);
            setSelectedGap(null);
          }}
          onSuccess={() => {
            setShowFillGapModal(false);
            setSelectedGap(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onFillGap?: (gap: Appointment) => void;
}

function AppointmentCard({ appointment, onFillGap }: AppointmentCardProps) {
  const navigate = useNavigate();
  const client = appointment.client as Client | undefined;

  const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60));
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const duration = getDuration(appointment.start_time, appointment.end_time);

  if (appointment.is_gap) {
    return (
      <div className="bg-white border-2 border-dashed border-amber-300 rounded-lg p-5 hover:border-amber-400 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </span>
              <span className="text-slate-400">({duration} min)</span>
            </div>
          </div>
          <button
            onClick={() => onFillGap?.(appointment)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            Fill Gap
          </button>
        </div>
        <p className="text-amber-700 mt-2 font-medium">Available slot</p>
      </div>
    );
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-slate-100 text-slate-800',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2 text-slate-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </span>
              <span className="text-slate-400">({duration} min)</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
              {appointment.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900">
                {client?.name || 'No client assigned'}
              </span>
            </div>

            <div className="text-slate-600">{appointment.title}</div>

            {appointment.location && (
              <div className="flex items-center space-x-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{appointment.location}</span>
              </div>
            )}
          </div>
        </div>

        {client && (
          <button
            onClick={() => navigate('/app/conversations')}
            className="ml-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Message
          </button>
        )}
      </div>

      {appointment.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-600">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
}

interface AddAppointmentModalProps {
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddAppointmentModal({ clients, onClose, onSuccess }: AddAppointmentModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.appointments.create({
        clientId: formData.clientId || null,
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        notes: formData.notes,
        status: 'scheduled',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add Appointment</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a client (optional)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Driving Lesson"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., 123 High Street"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface FillGapModalProps {
  gap: Appointment;
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

function FillGapModal({ gap, clients, onClose, onSuccess }: FillGapModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    location: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.appointments.update(gap.id, {
        clientId: formData.clientId,
        title: formData.title,
        location: formData.location,
        notes: formData.notes,
        isGap: false,
        status: 'scheduled',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to fill gap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Fill Gap</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center space-x-2 text-blue-900">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">
              {formatTime(gap.start_time)} - {formatTime(gap.end_time)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client *
            </label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.phone_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Driving Lesson"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., 123 High Street"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Booking...' : 'Fill Gap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
