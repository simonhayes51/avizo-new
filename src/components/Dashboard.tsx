import { useState, useEffect } from 'react';
import { Clock, MapPin, User, AlertCircle, Plus, X, Calendar as CalendarIcon, Users, DollarSign, TrendingUp, MessageSquare, Bell, Download, FileText, Send, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Appointment, Client } from '../types';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showFillGapModal, setShowFillGapModal] = useState(false);
  const [selectedGap, setSelectedGap] = useState<Appointment | null>(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    appointmentsThisMonth: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      const [appointmentsData, clientsData, weeklyData, monthlyData] = await Promise.all([
        api.appointments.getAll({
          date: selectedDate.toISOString().split('T')[0],
        }),
        api.clients.getAll(),
        api.appointments.getAll({
          startDate: getStartOfWeek().toISOString().split('T')[0],
          endDate: getEndOfWeek().toISOString().split('T')[0],
        }).catch(() => []),
        api.appointments.getAll({
          startDate: getStartOfMonth().toISOString().split('T')[0],
          endDate: getEndOfMonth().toISOString().split('T')[0],
        }).catch(() => [])
      ]);

      setAppointments(appointmentsData || []);
      setClients(clientsData || []);

      setStats({
        totalClients: clientsData?.length || 0,
        appointmentsToday: (appointmentsData || []).filter(apt => !apt.is_gap).length,
        appointmentsThisWeek: (weeklyData || []).filter(apt => !apt.is_gap).length,
        appointmentsThisMonth: (monthlyData || []).filter(apt => !apt.is_gap).length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setAppointments([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = () => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const getEndOfWeek = () => {
    const start = getStartOfWeek();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const getStartOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getEndOfMonth = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const handleFillGap = (gap: Appointment) => {
    setSelectedGap(gap);
    setShowFillGapModal(true);
  };

  const handleAddAppointment = () => {
    setShowAddModal(true);
  };

  const handleQuickAddToCalendar = () => {
    setShowQuickAddModal(true);
  };

  const gaps = appointments.filter((apt) => apt.is_gap);
  const scheduled = appointments.filter((apt) => !apt.is_gap && apt.status === 'scheduled');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-64 mb-2 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="h-4 bg-slate-200 rounded w-24 mb-4 animate-pulse" />
              <div className="h-8 bg-slate-300 rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-40 mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleQuickAddToCalendar}
            className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Quick Add
          </button>
          <button
            onClick={() => navigate('/app/clients')}
            className="inline-flex items-center px-5 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            <Users className="w-5 h-5 mr-2" />
            New Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl p-6 text-white transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-2">Total Clients</p>
              <p className="text-5xl font-bold">{stats.totalClients}</p>
              <p className="text-blue-100 text-xs mt-2">All time</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl group-hover:bg-white/30 transition">
              <Users className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg hover:shadow-2xl p-6 text-white transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-2">Today</p>
              <p className="text-5xl font-bold">{stats.appointmentsToday}</p>
              <p className="text-emerald-100 text-xs mt-2">appointments</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl group-hover:bg-white/30 transition">
              <CalendarIcon className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl p-6 text-white transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium mb-2">This Week</p>
              <p className="text-5xl font-bold">{stats.appointmentsThisWeek}</p>
              <p className="text-violet-100 text-xs mt-2">appointments</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl group-hover:bg-white/30 transition">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg hover:shadow-2xl p-6 text-white transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-2">This Month</p>
              <p className="text-5xl font-bold">{stats.appointmentsThisMonth}</p>
              <p className="text-amber-100 text-xs mt-2">appointments</p>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur rounded-xl group-hover:bg-white/30 transition">
              <FileText className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Available Gaps Alert */}
      {gaps.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Available Slots</h3>
              <p className="text-sm text-amber-700 mt-1">
                You have {gaps.length} gap{gaps.length !== 1 ? 's' : ''} in your schedule today. Fill them quickly to maximize your time!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
          <button
            onClick={handleAddAppointment}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Appointment
          </button>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
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
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/app/conversations')}
            className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">Send Message</span>
          </button>
          <button
            onClick={() => navigate('/app/calendar')}
            className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <CalendarIcon className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">View Calendar</span>
          </button>
          <button
            onClick={() => navigate('/app/clients')}
            className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">Manage Clients</span>
          </button>
          <button
            onClick={() => navigate('/app/settings')}
            className="flex flex-col items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <Bell className="w-8 h-8 text-amber-600 mb-2" />
            <span className="text-sm font-medium text-slate-900">Settings</span>
          </button>
        </div>
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

      {showQuickAddModal && (
        <QuickAddToCalendarModal
          clients={clients}
          onClose={() => setShowQuickAddModal(false)}
          onSuccess={() => {
            setShowQuickAddModal(false);
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

interface QuickAddToCalendarModalProps {
  clients: Client[];
  onClose: () => void;
  onSuccess: () => void;
}

function QuickAddToCalendarModal({ clients, onClose, onSuccess }: QuickAddToCalendarModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: '60',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

      await api.appointments.create({
        clientId: formData.clientId || null,
        title: formData.title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
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
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Quick Add to Calendar</h2>
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
              placeholder="e.g., Consultation"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Duration *
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
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
              {loading ? 'Adding...' : 'Add to Calendar'}
            </button>
          </div>
        </form>
      </div>
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

interface ClientScore {
  client: Client;
  score: number;
  reasons: string[];
  lastAppointment?: Date;
  daysSinceLastAppointment?: number;
  preferredTimeMatch: boolean;
  previousSameSlotBookings: number;
}

function FillGapModal({ gap, clients, onClose, onSuccess }: FillGapModalProps) {
  const [mode, setMode] = useState<'smart' | 'manual'>('smart');
  const [rankedClients, setRankedClients] = useState<ClientScore[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [messageTemplate, setMessageTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual mode state
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (mode === 'smart') {
      analyzeClientsWithAI();
    }
  }, [mode]);

  const analyzeClientsWithAI = async () => {
    setLoading(true);
    try {
      // Fetch all appointments to analyze patterns
      const allAppointments = await api.appointments.getAll({
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });

      const gapTime = new Date(gap.start_time);
      const gapDay = gapTime.getDay(); // 0-6 (Sunday-Saturday)
      const gapHour = gapTime.getHours();
      const gapMinute = gapTime.getMinutes();

      // AI scoring algorithm
      const scored: ClientScore[] = clients.map(client => {
        let score = 0;
        const reasons: string[] = [];

        // Get client's appointment history
        const clientAppointments = allAppointments.filter(apt =>
          apt.client && typeof apt.client === 'object' && apt.client.id === client.id
        );

        // Calculate days since last appointment
        let lastAppointment: Date | undefined;
        let daysSinceLastAppointment: number | undefined;

        if (clientAppointments.length > 0) {
          const sortedApts = clientAppointments
            .map(apt => new Date(apt.end_time))
            .sort((a, b) => b.getTime() - a.getTime());
          lastAppointment = sortedApts[0];
          daysSinceLastAppointment = Math.floor((Date.now() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24));

          // OVERDUE DETECTION (HIGH PRIORITY)
          if (daysSinceLastAppointment > 30) {
            score += 50;
            reasons.push(`Overdue by ${daysSinceLastAppointment} days`);
          } else if (daysSinceLastAppointment > 21) {
            score += 35;
            reasons.push(`Due for appointment (${daysSinceLastAppointment} days)`);
          } else if (daysSinceLastAppointment > 14) {
            score += 20;
            reasons.push(`Approaching due date (${daysSinceLastAppointment} days)`);
          }
        } else {
          // New client who hasn't booked yet
          score += 10;
          reasons.push('New client - no previous bookings');
        }

        // TIME SLOT PREFERENCE ANALYSIS
        let preferredTimeMatch = false;
        let previousSameSlotBookings = 0;

        const sameDayApts = clientAppointments.filter(apt => {
          const aptTime = new Date(apt.start_time);
          return aptTime.getDay() === gapDay;
        });

        const similarTimeApts = clientAppointments.filter(apt => {
          const aptTime = new Date(apt.start_time);
          const hourDiff = Math.abs(aptTime.getHours() - gapHour);
          const minuteDiff = Math.abs(aptTime.getMinutes() - gapMinute);
          return hourDiff === 0 && minuteDiff <= 30; // Within 30 minutes
        });

        if (sameDayApts.length > 0) {
          score += 15;
          reasons.push(`Usually books on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][gapDay]}s`);
        }

        if (similarTimeApts.length > 0) {
          preferredTimeMatch = true;
          previousSameSlotBookings = similarTimeApts.length;
          score += 25 + (similarTimeApts.length * 5);
          reasons.push(`Previously booked ${similarTimeApts.length}x at similar time`);
        }

        // BOOKING FREQUENCY (Regular clients are more likely to book)
        if (clientAppointments.length > 10) {
          score += 15;
          reasons.push('Regular client (10+ bookings)');
        } else if (clientAppointments.length > 5) {
          score += 10;
          reasons.push('Frequent client (5+ bookings)');
        }

        // RECENT ACTIVITY (Recently active clients are more engaged)
        if (daysSinceLastAppointment && daysSinceLastAppointment <= 7) {
          score += 10;
          reasons.push('Recently active');
        }

        // CANCELLATION RATE (Lower is better)
        const cancelledApts = clientAppointments.filter(apt => apt.status === 'cancelled');
        const cancellationRate = clientAppointments.length > 0
          ? cancelledApts.length / clientAppointments.length
          : 0;

        if (cancellationRate === 0 && clientAppointments.length > 3) {
          score += 10;
          reasons.push('Never cancelled');
        } else if (cancellationRate > 0.3) {
          score -= 15;
          reasons.push('High cancellation rate');
        }

        return {
          client,
          score,
          reasons,
          lastAppointment,
          daysSinceLastAppointment,
          preferredTimeMatch,
          previousSameSlotBookings,
        };
      });

      // Sort by score (highest first)
      const sorted = scored.sort((a, b) => b.score - a.score);
      setRankedClients(sorted);

      // Auto-generate message template
      const gapDate = new Date(gap.start_time);
      const dateStr = gapDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const timeStr = formatTime(gap.start_time);

      setMessageTemplate(
        `Hi {{client_name}}! 👋\n\n` +
        `We have an opening on ${dateStr} at ${timeStr}.\n\n` +
        `${sorted.length > 0 && sorted[0].daysSinceLastAppointment && sorted[0].daysSinceLastAppointment > 21
          ? "We haven't seen you in a while - would love to have you back! "
          : ""}` +
        `Would you like to book this slot?\n\n` +
        `Reply YES to confirm or let us know if you'd prefer a different time.`
      );
    } catch (err) {
      console.error('Error analyzing clients:', err);
      setError('Failed to analyze clients. Please try manual mode.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleClientSelection = (clientId: string) => {
    const newSet = new Set(selectedClients);
    if (newSet.has(clientId)) {
      newSet.delete(clientId);
    } else {
      newSet.add(clientId);
    }
    setSelectedClients(newSet);
  };

  const handleSendMessages = async () => {
    if (selectedClients.size === 0) {
      setError('Please select at least one client');
      return;
    }

    setSending(true);
    setError('');

    try {
      const promises = Array.from(selectedClients).map(async (clientId) => {
        const clientScore = rankedClients.find(cs => cs.client.id === clientId);
        if (!clientScore) return;

        // Create or get conversation
        const conversation = await api.conversations.create(clientId);

        // Send personalized message
        const personalizedMessage = messageTemplate.replace('{{client_name}}', clientScore.client.name);
        await api.conversations.sendMessage(conversation.id || conversation, personalizedMessage, 'business');
      });

      await Promise.all(promises);

      alert(`Successfully sent messages to ${selectedClients.size} client(s)!`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const manualLoading = true;
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600" />
              Smart Gap Filling
            </h2>
            <p className="text-slate-600 text-sm mt-1">AI-powered client matching for optimal bookings</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Gap Info */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900">
              <Clock className="w-5 h-5" />
              <span className="font-semibold text-lg">
                {formatTime(gap.start_time)} - {formatTime(gap.end_time)}
              </span>
              <span className="text-sm text-amber-700">
                ({new Date(gap.start_time).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })})
              </span>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setMode('smart')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  mode === 'smart'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Smart
                </div>
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  mode === 'manual'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        {mode === 'smart' ? (
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600">Analyzing clients with AI...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* AI Explanation */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">AI Analysis Complete</h3>
                      <p className="text-sm text-slate-600">
                        Clients ranked by: overdue appointments, time slot preferences, booking history, and engagement patterns.
                        Top matches are most likely to book this slot.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ranked Clients List */}
                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center justify-between">
                    <span>Recommended Clients ({rankedClients.length})</span>
                    {selectedClients.size > 0 && (
                      <span className="text-sm font-normal text-purple-600">
                        {selectedClients.size} selected
                      </span>
                    )}
                  </h3>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {rankedClients.slice(0, 20).map((clientScore, index) => (
                      <div
                        key={clientScore.client.id}
                        className={`p-4 border-2 rounded-xl transition cursor-pointer ${
                          selectedClients.has(clientScore.client.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-purple-300 bg-white'
                        }`}
                        onClick={() => toggleClientSelection(clientScore.client.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Rank Badge */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                              index === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-700' :
                              index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {index + 1}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-slate-900">{clientScore.client.name}</h4>
                                <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                  Score: {clientScore.score}
                                </span>
                              </div>

                              <div className="text-sm text-slate-600 mb-2">
                                {clientScore.client.phone_number}
                              </div>

                              {/* AI Reasons */}
                              <div className="flex flex-wrap gap-1.5">
                                {clientScore.reasons.map((reason, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs px-2 py-1 rounded ${
                                      reason.includes('Overdue') || reason.includes('Due for')
                                        ? 'bg-red-100 text-red-700'
                                        : reason.includes('time') || reason.includes('Usually books')
                                        ? 'bg-blue-100 text-blue-700'
                                        : reason.includes('Regular') || reason.includes('Frequent')
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Selection Checkbox */}
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            selectedClients.has(clientScore.client.id)
                              ? 'bg-purple-600 border-purple-600'
                              : 'border-slate-300'
                          }`}>
                            {selectedClients.has(clientScore.client.id) && (
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Template */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message Template
                  </label>
                  <textarea
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use {'{{client_name}}'} to personalize. Message will be sent via chat to selected clients.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessages}
                    disabled={sending || selectedClients.size === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send to {selectedClients.size > 0 ? selectedClients.size : ''} Client{selectedClients.size !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Fill Gap
              </button>
            </div>
          </form>
        )}
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
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 2 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
