import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import api from '../lib/api';

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string;
  is_gap: boolean;
  client: any;
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [currentDate, view]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate();
      const endDate = getEndDate();

      const data = await api.appointments.getAll({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    if (view === 'month') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      start.setDate(start.getDate() - start.getDay()); // Start from Sunday
      return start;
    } else {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay()); // Start from Sunday
      return start;
    }
  };

  const getEndDate = () => {
    if (view === 'month') {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay())); // End on Saturday
      return end;
    } else {
      const end = new Date(currentDate);
      end.setDate(end.getDate() - end.getDay() + 6); // End on Saturday
      return end;
    }
  };

  const getDaysInView = () => {
    const days: Date[] = [];
    const start = getStartDate();
    const daysCount = view === 'month' ? 42 : 7; // 6 weeks for month, 1 week for week view

    for (let i = 0; i < daysCount; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_time);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (appointment: Appointment) => {
    if (appointment.is_gap) return 'bg-amber-100 border-amber-300 text-amber-700';
    switch (appointment.status) {
      case 'scheduled': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'completed': return 'bg-green-100 border-green-300 text-green-700';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-700';
      default: return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Calendar
          </h1>
          <p className="text-slate-600 mt-1">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            Today
          </button>

          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg transition ${
                view === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg transition ${
                view === 'week'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={navigatePrevious}
              className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={navigateNext}
              className="p-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-slate-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className={`grid grid-cols-7 ${view === 'month' ? 'grid-rows-6' : 'grid-rows-1'}`}>
          {getDaysInView().map((date, index) => {
            const dayAppointments = getAppointmentsForDay(date);
            const isTodayDate = isToday(date);
            const isCurrentMonthDate = isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-slate-200 p-2 ${
                  !isCurrentMonthDate && view === 'month' ? 'bg-slate-50' : 'bg-white'
                } ${isTodayDate ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isTodayDate
                    ? 'text-blue-600'
                    : isCurrentMonthDate
                    ? 'text-slate-900'
                    : 'text-slate-400'
                }`}>
                  {date.getDate()}
                  {isTodayDate && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div
                      key={apt.id}
                      className={`text-xs p-1.5 rounded border ${getStatusColor(apt)} truncate`}
                    >
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {formatTime(apt.start_time)}
                      </div>
                      <div className="truncate">
                        {apt.is_gap ? 'Available' : apt.client?.name || 'No client'}
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-slate-600 pl-1.5">
                      +{dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
          <span className="text-sm text-slate-600">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
          <span className="text-sm text-slate-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
          <span className="text-sm text-slate-600">Available Slot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
          <span className="text-sm text-slate-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
}
