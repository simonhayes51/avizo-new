import { useState, useEffect } from 'react';
import { Send, Search, Phone, ChevronLeft, Plus, X, MessageSquare as MessageIcon, Zap, Smile } from 'lucide-react';
import api from '../lib/api';
import { Conversation, Message, Client } from '../types';

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Message templates
  const messageTemplates = [
    { id: 1, name: 'Appointment Confirmation', message: 'Hi! This is to confirm your appointment on {date} at {time}. Please reply to confirm or let us know if you need to reschedule.' },
    { id: 2, name: 'Appointment Reminder', message: 'Reminder: You have an appointment tomorrow at {time}. Looking forward to seeing you!' },
    { id: 3, name: 'Thank You', message: 'Thank you for choosing our service! We appreciate your business and look forward to serving you again.' },
    { id: 4, name: 'Follow Up', message: 'Hi! Just following up to see if you have any questions or if there\'s anything else we can help you with.' },
    { id: 5, name: 'Cancellation', message: 'We understand you need to cancel your appointment. Please let us know when you\'d like to reschedule.' },
  ];

  const quickReplies = [
    'Thank you!',
    'Sounds good',
    'Will get back to you shortly',
    'Confirmed',
    'Yes, that works',
    'See you then',
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const data = await api.conversations.getAll();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await api.conversations.getMessages(conversationId);
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await api.conversations.sendMessage(
        selectedConversation.id,
        newMessage,
        'business'
      );

      setNewMessage('');
      loadMessages(selectedConversation.id);
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const client = conv.client as Client;
    return client?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 border-r border-slate-200 flex-col bg-white`}>
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Message
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start a Conversation
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                selected={selectedConversation?.id === conversation.id}
                onClick={() => setSelectedConversation(conversation)}
              />
            ))
          )}
        </div>
      </div>

      <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-slate-50`}>
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-900">
                    {(selectedConversation.client as Client)?.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {(selectedConversation.client as Client)?.phone_number}
                  </p>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>

            <div className="bg-white border-t border-slate-200 p-4">
              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setNewMessage(reply);
                        setShowQuickReplies(false);
                      }}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Templates */}
              {showTemplates && (
                <div className="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm">Message Templates</h3>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {messageTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setNewMessage(template.message);
                          setShowTemplates(false);
                        }}
                        className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                      >
                        <h4 className="font-medium text-slate-900 text-sm mb-1 group-hover:text-blue-700">
                          {template.name}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{template.message}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setShowQuickReplies(!showQuickReplies);
                      setShowTemplates(false);
                    }}
                    className={`p-2 rounded-lg transition ${
                      showQuickReplies
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Quick Replies"
                  >
                    <Zap className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplates(!showTemplates);
                      setShowQuickReplies(false);
                    }}
                    className={`p-2 rounded-lg transition ${
                      showTemplates
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Templates"
                  >
                    <MessageIcon className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Press Enter to send, Shift+Enter for new line. Use templates and quick replies for faster responses.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="mb-4">Select a conversation to start messaging</p>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </button>
            </div>
          </div>
        )}
      </div>

      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onSuccess={(conversation) => {
            setShowNewMessageModal(false);
            setSelectedConversation(conversation);
            loadConversations();
          }}
        />
      )}
    </div>
  );
}

interface NewMessageModalProps {
  onClose: () => void;
  onSuccess: (conversation: Conversation) => void;
}

function NewMessageModal({ onClose, onSuccess }: NewMessageModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!selectedClient || !message.trim()) return;

    setSending(true);
    setError('');

    try {
      // Create or get conversation
      const conversation = await api.conversations.create(selectedClient.id);

      // Send the message
      await api.conversations.sendMessage(conversation.id, message, 'business');

      onSuccess(conversation);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone_number.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Client *
              </label>

              {!selectedClient ? (
                <>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                    {loading ? (
                      <div className="p-4 text-center text-slate-500">Loading clients...</div>
                    ) : filteredClients.length === 0 ? (
                      <div className="p-4 text-center text-slate-500">
                        {searchTerm ? 'No clients found' : 'No clients yet. Add a client first.'}
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => setSelectedClient(client)}
                          className="w-full p-3 flex items-center space-x-3 hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900">{client.name}</p>
                            <p className="text-sm text-slate-500">{client.phone_number}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{selectedClient.name}</p>
                    <p className="text-sm text-slate-500">{selectedClient.phone_number}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="p-1 hover:bg-blue-100 rounded transition"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              )}
            </div>

            {selectedClient && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedClient || !message.trim() || sending}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const client = conversation.client as Client;
  const timeAgo = getTimeAgo(conversation.last_message_at);

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors border-b border-slate-100 ${
        selected ? 'bg-blue-50' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
        {client?.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-semibold text-slate-900 truncate">{client?.name}</h3>
          <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{timeAgo}</span>
        </div>
        <p className="text-sm text-slate-600 truncate">{client?.phone_number}</p>
        {conversation.unread_count > 0 && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {conversation.unread_count}
          </span>
        )}
      </div>
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isFromBusiness = message.sender_type === 'business';

  return (
    <div className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
          isFromBusiness
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        <p
          className={`text-xs mt-1.5 ${
            isFromBusiness ? 'text-blue-100' : 'text-slate-500'
          }`}
        >
          {new Date(message.sent_at).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
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
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
