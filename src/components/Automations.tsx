import { useState, useEffect } from 'react';
import { Plus, Zap, Edit2, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Automation } from '../types';

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading automations:', error);
    } else {
      setAutomations(data || []);
    }
    setLoading(false);
  };

  const toggleAutomation = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('automations')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling automation:', error);
      return;
    }

    loadAutomations();
  };

  const deleteAutomation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    const { error } = await supabase.from('automations').delete().eq('id', id);

    if (error) {
      console.error('Error deleting automation:', error);
      return;
    }

    loadAutomations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Loading automations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Automations</h1>
          <p className="text-slate-600 mt-1">Set up automatic messages and workflows</p>
        </div>
        <button
          onClick={() => {
            setEditingAutomation(null);
            setShowForm(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>New Automation</span>
        </button>
      </div>

      {automations.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No automations set up yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Automation</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {automations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onToggle={() => toggleAutomation(automation.id, automation.is_active)}
              onEdit={() => {
                setEditingAutomation(automation);
                setShowForm(true);
              }}
              onDelete={() => deleteAutomation(automation.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <AutomationForm
          automation={editingAutomation}
          onClose={() => {
            setShowForm(false);
            setEditingAutomation(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingAutomation(null);
            loadAutomations();
          }}
        />
      )}
    </div>
  );
}

function AutomationCard({
  automation,
  onToggle,
  onEdit,
  onDelete,
}: {
  automation: Automation;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getTriggerLabel = () => {
    const hours = Math.abs(automation.trigger_offset_hours);
    const when = automation.trigger_offset_hours < 0 ? 'before' : 'after';

    switch (automation.trigger_type) {
      case 'before_appointment':
        return `${hours}h before appointment`;
      case 'after_appointment':
        return `${hours}h after appointment`;
      case 'cancellation':
        return 'When appointment is cancelled';
      default:
        return automation.trigger_type;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{automation.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                automation.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {automation.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-600 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{getTriggerLabel()}</span>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{automation.message_template}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title={automation.is_active ? 'Deactivate' : 'Activate'}
          >
            {automation.is_active ? (
              <ToggleRight className="w-6 h-6 text-green-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface AutomationFormProps {
  automation: Automation | null;
  onClose: () => void;
  onSave: () => void;
}

function AutomationForm({ automation, onClose, onSave }: AutomationFormProps) {
  const [name, setName] = useState(automation?.name || '');
  const [triggerType, setTriggerType] = useState(automation?.trigger_type || 'before_appointment');
  const [offsetHours, setOffsetHours] = useState(Math.abs(automation?.trigger_offset_hours || 24));
  const [messageTemplate, setMessageTemplate] = useState(automation?.message_template || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !messageTemplate) return;

    setLoading(true);

    const automationData = {
      name,
      trigger_type: triggerType,
      trigger_offset_hours: triggerType === 'before_appointment' ? -offsetHours : offsetHours,
      message_template: messageTemplate,
      is_active: true,
    };

    let error;
    if (automation) {
      ({ error } = await supabase
        .from('automations')
        .update(automationData)
        .eq('id', automation.id));
    } else {
      ({ error } = await supabase.from('automations').insert(automationData));
    }

    setLoading(false);

    if (error) {
      console.error('Error saving automation:', error);
      return;
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {automation ? 'Edit Automation' : 'New Automation'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Automation Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 24h Reminder, Thank You Message"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trigger Type *
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="before_appointment">Before Appointment</option>
              <option value="after_appointment">After Appointment</option>
              <option value="cancellation">On Cancellation</option>
            </select>
          </div>

          {(triggerType === 'before_appointment' || triggerType === 'after_appointment') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hours {triggerType === 'before_appointment' ? 'Before' : 'After'}
              </label>
              <input
                type="number"
                value={offsetHours}
                onChange={(e) => setOffsetHours(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message Template *
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Hi {{client_name}}, this is a reminder about your {{appointment_title}} on {{date}} at {{time}}."
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              Use variables: {'{'}{'{'} client_name {'}'}{'}'}, {'{'}{'{'} appointment_title {'}'}{'}'}, {'{'}{'{'} date {'}'}{'}'}, {'{'}{'{'} time {'}'}{'}'}
            </p>
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
            onClick={handleSave}
            disabled={!name || !messageTemplate || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : automation ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
