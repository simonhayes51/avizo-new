import { useState } from 'react';
import { Users, UserPlus, Mail, Phone, Calendar, Shield, Clock, TrendingUp, Award, X, Edit2, Trash2, MoreVertical } from 'lucide-react';
import Tooltip, { HelpButton } from './Tooltip';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff';
  avatar: string;
  status: 'active' | 'away' | 'offline';
  joinedDate: Date;
  appointmentsToday: number;
  appointmentsTotal: number;
  rating: number;
  revenue: number;
  schedule: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
}

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'performance'>('overview');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@business.com',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      avatar: 'SJ',
      status: 'active',
      joinedDate: new Date('2024-01-15'),
      appointmentsToday: 8,
      appointmentsTotal: 342,
      rating: 4.9,
      revenue: 45200,
      schedule: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '15:00', available: true },
        saturday: { start: '00:00', end: '00:00', available: false },
        sunday: { start: '00:00', end: '00:00', available: false },
      },
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@business.com',
      phone: '+1 (555) 234-5678',
      role: 'manager',
      avatar: 'MC',
      status: 'active',
      joinedDate: new Date('2024-03-20'),
      appointmentsToday: 6,
      appointmentsTotal: 256,
      rating: 4.8,
      revenue: 38900,
      schedule: {
        monday: { start: '10:00', end: '18:00', available: true },
        tuesday: { start: '10:00', end: '18:00', available: true },
        wednesday: { start: '10:00', end: '18:00', available: true },
        thursday: { start: '10:00', end: '18:00', available: true },
        friday: { start: '10:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '13:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false },
      },
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@business.com',
      phone: '+1 (555) 345-6789',
      role: 'staff',
      avatar: 'ED',
      status: 'away',
      joinedDate: new Date('2024-06-10'),
      appointmentsToday: 5,
      appointmentsTotal: 189,
      rating: 4.7,
      revenue: 28400,
      schedule: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '00:00', end: '00:00', available: false },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '15:00', available: true },
        sunday: { start: '09:00', end: '13:00', available: true },
      },
    },
    {
      id: '4',
      name: 'James Wilson',
      email: 'james@business.com',
      phone: '+1 (555) 456-7890',
      role: 'staff',
      avatar: 'JW',
      status: 'offline',
      joinedDate: new Date('2024-08-05'),
      appointmentsToday: 0,
      appointmentsTotal: 95,
      rating: 4.6,
      revenue: 15800,
      schedule: {
        monday: { start: '13:00', end: '21:00', available: true },
        tuesday: { start: '13:00', end: '21:00', available: true },
        wednesday: { start: '13:00', end: '21:00', available: true },
        thursday: { start: '00:00', end: '00:00', available: false },
        friday: { start: '13:00', end: '21:00', available: true },
        saturday: { start: '13:00', end: '21:00', available: true },
        sunday: { start: '00:00', end: '00:00', available: false },
      },
    },
  ];

  const stats = {
    totalTeam: teamMembers.length,
    activeNow: teamMembers.filter(m => m.status === 'active').length,
    avgRating: teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length,
    totalRevenue: teamMembers.reduce((sum, m) => sum + m.revenue, 0),
    totalAppointments: teamMembers.reduce((sum, m) => sum + m.appointmentsTotal, 0),
  };

  const getRoleBadge = (role: TeamMember['role']) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      staff: 'bg-green-100 text-green-700',
    };

    const icons = {
      admin: <Shield className="w-3 h-3" />,
      manager: <Award className="w-3 h-3" />,
      staff: <Users className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {icons[role]}
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusIndicator = (status: TeamMember['status']) => {
    const colors = {
      active: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-slate-400',
    };

    return <div className={`w-3 h-3 rounded-full ${colors[status]}`} />;
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
            <p className="text-slate-600 mt-1">Manage your staff, schedules, and performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <HelpButton
            title="Team Management Help"
            description={`Manage your team members, their schedules, and track performance.\n\nRoles:\n- Admin: Full access to all features and settings\n- Manager: Can manage schedules and view reports\n- Staff: Can view their own schedule and appointments\n\nSchedule: Set weekly availability for each team member to ensure proper coverage.\n\nPerformance: Track appointments, ratings, and revenue per team member.`}
          />
          <button
            onClick={() => setShowAddMember(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition"
          >
            <UserPlus className="w-5 h-5" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="text-sm text-slate-600">Team Size</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalTeam}</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-600">Active Now</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.activeNow}</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-slate-600">Avg Rating</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.avgRating.toFixed(1)} ⭐</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-slate-600">Total Appointments</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.totalAppointments}</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 hover-lift">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-slate-600">Total Revenue</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">${(stats.totalRevenue / 1000).toFixed(0)}K</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Team Overview
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'schedule'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Schedule
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'performance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Performance
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg transition group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIndicator(member.status)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(member.role)}
                      <span className="text-xs text-slate-500">
                        Since {member.joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition">
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {member.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  {member.phone}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <div className="text-xs text-slate-600">Today</div>
                  <div className="text-lg font-bold text-slate-900">{member.appointmentsToday}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Total</div>
                  <div className="text-lg font-bold text-slate-900">{member.appointmentsTotal}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Rating</div>
                  <div className="text-lg font-bold text-yellow-600">{member.rating} ⭐</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Revenue Generated</span>
                  <span className="text-lg font-bold text-emerald-600">${member.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-900">Team Member</th>
                  {daysOfWeek.map((day) => (
                    <th key={day} className="text-center py-4 px-4 font-semibold text-slate-900">
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{member.name}</div>
                          {getRoleBadge(member.role)}
                        </div>
                      </div>
                    </td>
                    {daysOfWeek.map((day) => {
                      const schedule = member.schedule[day];
                      return (
                        <td key={day} className="py-4 px-4 text-center">
                          {schedule.available ? (
                            <div className="text-xs">
                              <div className="font-medium text-green-600">{schedule.start}</div>
                              <div className="text-slate-500">to</div>
                              <div className="font-medium text-red-600">{schedule.end}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Off</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-6">Performance Rankings</h3>
            <div className="space-y-4">
              {teamMembers
                .sort((a, b) => b.revenue - a.revenue)
                .map((member, index) => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-slate-900">{member.name}</span>
                        {getRoleBadge(member.role)}
                        <span className="text-sm text-yellow-600 font-medium">{member.rating} ⭐</span>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs text-slate-600">Appointments</div>
                          <div className="font-semibold text-slate-900">{member.appointmentsTotal}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600">Revenue</div>
                          <div className="font-semibold text-emerald-600">${member.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-600">Avg per Appointment</div>
                          <div className="font-semibold text-blue-600">
                            ${(member.revenue / member.appointmentsTotal).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Add Team Member</h2>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="john@business.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
