import { useState, useEffect } from 'react';
import { Clock, MapPin, User, AlertCircle, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { Appointment, Client } from '../types';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await api.appointments.getAll({
        date: selectedDate.toISOString().split('T')[0],
      });

      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
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

  const getDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / (1000 * 60));
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
            <button className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Appointment</span>
            </button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const client = appointment.client as Client | undefined;
  const duration = getDuration(appointment.start_time, appointment.end_time);

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

  if (appointment.is_gap) {
    return (
      <div className="bg-white border-2 border-dashed border-amber-300 rounded-lg p-5 hover:border-amber-400 transition-colors cursor-pointer">
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
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium">
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
          <button className="ml-4 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
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
