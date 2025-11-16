import { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, X, Mail, Phone, Tag, Upload, Download, Filter, MessageSquare, CheckSquare, Square } from 'lucide-react';
import api from '../lib/api';

interface Client {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    notes: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    let filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone_number.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply tag filter
    if (filterTag) {
      filtered = filtered.filter(client => client.tags?.includes(filterTag));
    }

    setFilteredClients(filtered);

    // Extract all unique tags
    const tags = new Set<string>();
    clients.forEach(client => {
      client.tags?.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, [searchQuery, clients, filterTag]);

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingClient) {
        await api.clients.update(editingClient.id, formData);
        setSuccess('Client updated successfully!');
      } else {
        await api.clients.create(formData);
        setSuccess('Client added successfully!');
      }
      await loadClients();
      closeModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Failed to save client:', error);
      const errorMessage = error.message || 'Failed to save client. Please try again.';
      // Extract more details if available
      const detailedError = error.response?.data?.details || error.response?.data?.error || errorMessage;

      // Handle session expiration
      if (error.response?.data?.code === 'USER_NOT_FOUND' || error.response?.data?.code === 'SESSION_EXPIRED') {
        setError(detailedError + ' Redirecting to login...');
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/';
        }, 2000);
      } else {
        setError(detailedError);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.clients.delete(id);
      await loadClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        phoneNumber: client.phone_number,
        email: client.email || '',
        notes: client.notes || '',
        tags: client.tags || [],
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        notes: '',
        tags: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)));
    }
  };

  const toggleSelectClient = (clientId: string) => {
    const newSelected = new Set(selectedClients);
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId);
    } else {
      newSelected.add(clientId);
    }
    setSelectedClients(newSelected);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedClients.size} client(s)?`)) return;

    try {
      await Promise.all(Array.from(selectedClients).map(id => api.clients.delete(id)));
      setSuccess(`Successfully deleted ${selectedClients.size} client(s)`);
      setSelectedClients(new Set());
      await loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete some clients');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Bulk tag
  const handleBulkTag = async (newTag: string) => {
    if (!newTag.trim()) return;

    try {
      const updates = Array.from(selectedClients).map(async (id) => {
        const client = clients.find(c => c.id === id);
        if (client) {
          const updatedTags = [...(client.tags || [])];
          if (!updatedTags.includes(newTag)) {
            updatedTags.push(newTag);
          }
          await api.clients.update(id, {
            name: client.name,
            phoneNumber: client.phone_number,
            email: client.email,
            notes: client.notes,
            tags: updatedTags
          });
        }
      });

      await Promise.all(updates);
      setSuccess(`Successfully tagged ${selectedClients.size} client(s)`);
      setSelectedClients(new Set());
      await loadClients();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to tag some clients');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const csvData = [
      ['Name', 'Phone Number', 'Email', 'Tags', 'Notes'],
      ...clients.map(client => [
        client.name,
        client.phone_number,
        client.email || '',
        (client.tags || []).join('; '),
        client.notes || ''
      ])
    ];

    const csvContent = csvData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSuccess('Clients exported successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600" />
            Clients
          </h1>
          <p className="text-slate-600 mt-1">Manage your client database</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-white border-2 border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50 transition"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="bg-white border-2 border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-50 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex gap-3 items-start">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className={`px-4 py-3 border rounded-lg font-medium flex items-center gap-2 transition ${
            filterTag
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          {filterTag ? `Tag: ${filterTag}` : 'Filter'}
        </button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedClients.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-blue-900 font-medium">
            {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <BulkTagButton onTag={handleBulkTag} allTags={allTags} />
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={() => setSelectedClients(new Set())}
              className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Select All */}
      {filteredClients.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition"
          >
            {selectedClients.size === filteredClients.length && filteredClients.length > 0 ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            Select All
          </button>
        </div>
      )}

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">
            {searchQuery || filterTag ? 'No clients found matching your filters.' : 'No clients yet. Add your first client to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-lg transition group ${
                selectedClients.has(client.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleSelectClient(client.id)}
                    className="mt-1"
                  >
                    {selectedClients.has(client.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {client.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition ml-2">
                  <button
                    onClick={() => openModal(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone_number}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{client.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Any additional notes about this client..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition"
                >
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={async () => {
            setShowImportModal(false);
            await loadClients();
            setSuccess('Clients imported successfully!');
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          allTags={allTags}
          selectedTag={filterTag}
          onSelectTag={(tag) => {
            setFilterTag(tag);
            setShowFilterModal(false);
          }}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}

// Import Modal Component
function ImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a CSV file');
      }
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const clients = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const client: any = {};

      headers.forEach((header, index) => {
        if (header === 'name') client.name = values[index];
        if (header === 'phone number' || header === 'phone') client.phoneNumber = values[index];
        if (header === 'email') client.email = values[index];
        if (header === 'notes') client.notes = values[index];
        if (header === 'tags') {
          client.tags = values[index] ? values[index].split(';').map(t => t.trim()).filter(Boolean) : [];
        }
      });

      if (client.name && client.phoneNumber) {
        clients.push(client);
      }
    }

    return clients;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError('');

    try {
      const text = await file.text();
      const clients = parseCSV(text);

      if (clients.length === 0) {
        setError('No valid clients found in CSV. Make sure it has "name" and "phone number" columns.');
        setImporting(false);
        return;
      }

      // Import clients one by one
      let successCount = 0;
      let failCount = 0;

      for (const client of clients) {
        try {
          await api.clients.create(client);
          successCount++;
        } catch (err) {
          failCount++;
        }
      }

      if (successCount > 0) {
        onSuccess();
      } else {
        setError(`Failed to import all clients. Please check the format.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import clients');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'Name,Phone Number,Email,Tags,Notes\n"John Doe","+1234567890","john@example.com","VIP; Regular","Important client"\n"Jane Smith","+0987654321","jane@example.com","New","First time visitor"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Import Clients</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">CSV Format</h3>
            <p className="text-sm text-blue-800 mb-3">
              Your CSV should have these columns: Name, Phone Number, Email, Tags, Notes
            </p>
            <button
              onClick={downloadTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <p className="text-slate-700 font-medium mb-2">
              {file ? file.name : 'Drag and drop your CSV file here'}
            </p>
            <p className="text-sm text-slate-500 mb-3">or</p>
            <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Import Clients'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Filter Modal Component
function FilterModal({
  allTags,
  selectedTag,
  onSelectTag,
  onClose,
}: {
  allTags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Filter by Tag</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {allTags.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No tags available</p>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onSelectTag('')}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  !selectedTag
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Clients
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Bulk Tag Button Component
function BulkTagButton({ onTag, allTags }: { onTag: (tag: string) => void; allTags: string[] }) {
  const [showMenu, setShowMenu] = useState(false);
  const [newTag, setNewTag] = useState('');

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
      >
        <Tag className="w-4 h-4" />
        Add Tag
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-20">
            <div className="p-3 border-b border-slate-200">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    onTag(newTag.trim());
                    setNewTag('');
                    setShowMenu(false);
                  }
                }}
                placeholder="New tag..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                autoFocus
              />
            </div>
            {allTags.length > 0 && (
              <div className="max-h-48 overflow-y-auto p-2">
                <p className="text-xs text-slate-500 px-2 py-1">Or select existing:</p>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      onTag(tag);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 text-sm text-slate-700 hover:text-blue-600 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
