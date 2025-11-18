import { useState } from 'react';
import { DollarSign, CreditCard, Plus, Search, Download, Filter, Eye, Send, CheckCircle, Clock, XCircle, Calendar, User } from 'lucide-react';
import { HelpButton } from './Tooltip';
import { useToast } from './Toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  paymentMethod?: string;
  notes?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export default function Payments() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments'>('overview');
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const { showToast } = useToast();

  // Sample data - would come from API
  const invoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      clientName: 'Sarah Johnson',
      date: new Date('2025-01-10'),
      dueDate: new Date('2025-01-24'),
      items: [
        { description: 'Driving Lesson (2 hours)', quantity: 1, price: 80, total: 80 },
        { description: 'Theory Test Preparation', quantity: 1, price: 30, total: 30 },
      ],
      subtotal: 110,
      tax: 22,
      total: 132,
      status: 'paid',
      paymentMethod: 'Credit Card',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      clientName: 'Michael Chen',
      date: new Date('2025-01-15'),
      dueDate: new Date('2025-01-29'),
      items: [
        { description: 'Haircut & Styling', quantity: 1, price: 65, total: 65 },
      ],
      subtotal: 65,
      tax: 13,
      total: 78,
      status: 'pending',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2025-003',
      clientName: 'Emma Davis',
      date: new Date('2024-12-20'),
      dueDate: new Date('2025-01-03'),
      items: [
        { description: 'Deep Tissue Massage', quantity: 1, price: 90, total: 90 },
        { description: 'Aromatherapy Add-on', quantity: 1, price: 20, total: 20 },
      ],
      subtotal: 110,
      tax: 22,
      total: 132,
      status: 'overdue',
    },
  ];

  const stats = {
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    pendingPayments: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0),
    overduePayments: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0),
    thisMonth: invoices.filter(i => {
      const month = new Date().getMonth();
      return i.date.getMonth() === month;
    }).reduce((sum, i) => sum + i.total, 0),
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowSendModal(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    showToast(`Downloading ${invoice.invoiceNumber}...`, 'info');
    // In real app, would trigger PDF download
    setTimeout(() => {
      showToast(`${invoice.invoiceNumber} downloaded successfully!`, 'success');
    }, 1500);
  };

  const handleSendEmail = () => {
    if (selectedInvoice) {
      showToast(`Invoice sent to ${selectedInvoice.clientName}!`, 'success');
      setShowSendModal(false);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    const icons = {
      paid: <CheckCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      overdue: <XCircle className="w-4 h-4" />,
      draft: <Edit className="w-4 h-4" />,
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payments & Invoicing</h1>
            <p className="text-slate-600 mt-1">Manage invoices and track payments</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <HelpButton
            title="Payments Help"
            description={`Manage all your invoices and payments in one place.\n\nInvoices: Create professional invoices for services rendered. Send them to clients via email.\n\nPayments: Track which invoices have been paid and which are outstanding.\n\nOverdue: See which payments are overdue and send reminders.\n\nRevenue: Monitor your total revenue and monthly income.`}
          />
          <button
            onClick={() => setShowNewInvoice(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-green-100">Total Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">${stats.thisMonth.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-blue-100">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">${stats.pendingPayments.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-yellow-100">Pending Payments</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="w-8 h-8 opacity-80" />
            <div className="text-right">
              <div className="text-3xl font-bold">${stats.overduePayments.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-red-100">Overdue Payments</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'invoices'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'payments'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment History
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Invoices</h3>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {invoice.clientName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-slate-900">${invoice.total.toFixed(2)}</div>
                      <div className="text-sm text-slate-600">
                        Due {invoice.dueDate.toLocaleDateString()}
                      </div>
                    </div>
                    {getStatusBadge(invoice.status)}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                        title="View Invoice"
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleSendInvoice(invoice)}
                        className="p-2 hover:bg-green-50 rounded-lg transition"
                        title="Send Invoice"
                      >
                        <Send className="w-5 h-5 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="p-2 hover:bg-purple-50 rounded-lg transition"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5 text-purple-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Revenue Over Time</h3>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-slate-600 font-medium">Revenue chart coming soon</div>
                <div className="text-sm text-slate-500 mt-1">Track your income trends over time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">All Invoices</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                  <Filter className="w-5 h-5" />
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Due Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-700">{invoice.clientName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-600 text-sm">{invoice.date.toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-600 text-sm">{invoice.dueDate.toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">${invoice.total.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(invoice.status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition"
                            title="View Invoice"
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleSendInvoice(invoice)}
                            className="p-2 hover:bg-green-50 rounded-lg transition"
                            title="Send Invoice"
                          >
                            <Send className="w-5 h-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5 text-purple-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Payment History</h3>
          <div className="space-y-3">
            {invoices.filter(i => i.status === 'paid').map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{invoice.clientName}</div>
                    <div className="text-sm text-slate-600">{invoice.invoiceNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-bold text-green-600">${invoice.total.toFixed(2)}</div>
                    <div className="text-sm text-slate-600">{invoice.paymentMethod}</div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {invoice.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Invoice Modal (placeholder) */}
      {showNewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Invoice</h2>
            <div className="text-center py-12 text-slate-600">
              <div className="text-6xl mb-4">🧾</div>
              <div className="text-lg font-medium mb-2">Invoice Builder Coming Soon</div>
              <div className="text-sm mb-6">This will allow you to create custom invoices with line items, taxes, and more.</div>
              <button
                onClick={() => setShowNewInvoice(false)}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Detail Modal */}
      {showInvoiceDetail && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Invoice</h2>
                  <div className="text-green-100">{selectedInvoice.invoiceNumber}</div>
                </div>
                <button
                  onClick={() => setShowInvoiceDetail(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-green-100 mb-1">Bill To:</div>
                  <div className="text-xl font-semibold">{selectedInvoice.clientName}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-100 mb-1">Date Issued:</div>
                  <div className="font-semibold">{selectedInvoice.date.toLocaleDateString()}</div>
                  <div className="text-green-100 mt-2">Due Date:</div>
                  <div className="font-semibold">{selectedInvoice.dueDate.toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-8">
              {/* Line Items */}
              <div className="mb-6">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Items</h3>
                <table className="w-full">
                  <thead className="border-b-2 border-slate-200">
                    <tr>
                      <th className="text-left py-3 text-slate-700 font-semibold">Description</th>
                      <th className="text-center py-3 text-slate-700 font-semibold">Qty</th>
                      <th className="text-right py-3 text-slate-700 font-semibold">Price</th>
                      <th className="text-right py-3 text-slate-700 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-3 text-slate-900">{item.description}</td>
                        <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-600">${item.price.toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold text-slate-900">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t-2 border-slate-200 pt-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tax (20%):</span>
                    <span className="font-semibold">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-900 border-t-2 border-slate-200 pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Status: {getStatusBadge(selectedInvoice.status)}
                </div>
                {selectedInvoice.paymentMethod && (
                  <div className="text-sm text-slate-600">
                    Payment Method: <span className="font-semibold">{selectedInvoice.paymentMethod}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    handleDownloadInvoice(selectedInvoice);
                    setShowInvoiceDetail(false);
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    setShowInvoiceDetail(false);
                    handleSendInvoice(selectedInvoice);
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {showSendModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-8 animate-scaleIn">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <Send className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Send Invoice</h3>
                <p className="text-slate-600">{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Send To</label>
                <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{selectedInvoice.clientName}</div>
                  <div className="text-sm text-slate-600">client@example.com</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  defaultValue={`Invoice ${selectedInvoice.invoiceNumber} from Your Business`}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  defaultValue={`Hi ${selectedInvoice.clientName},\n\nThank you for your business! Please find attached invoice ${selectedInvoice.invoiceNumber} for $${selectedInvoice.total.toFixed(2)}.\n\nPayment is due by ${selectedInvoice.dueDate.toLocaleDateString()}.\n\nBest regards`}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Edit({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
