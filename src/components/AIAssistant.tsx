import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Zap, TrendingUp, Calendar, Users, DollarSign, Bot, Lightbulb } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  icon: any;
  action: () => void;
}

interface AIAssistantProps {
  clients?: any[];
  appointments?: any[];
}

export default function AIAssistant({ clients = [], appointments = [] }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    const initialMessage: Message = {
      id: '1',
      type: 'assistant',
      content: `${greeting}! 👋 I'm your AI assistant. I can help you with:\n\n• Managing appointments and clients\n• Analyzing your business performance\n• Generating insights and recommendations\n• Answering questions about features\n• Creating content and messages\n\nHow can I help you today?`,
      timestamp: new Date(),
      suggestions: [
        'Show me today\'s appointments',
        'Analyze my revenue trends',
        'Find clients who need follow-up',
        'Help me write a marketing message',
      ],
    };

    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeIntent = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Revenue/Financial queries
    if (input.includes('revenue') || input.includes('money') || input.includes('income') || input.includes('earnings')) {
      const totalRevenue = appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      const thisMonth = appointments.filter(apt => {
        const aptDate = new Date(apt.start_time);
        const now = new Date();
        return aptDate.getMonth() === now.getMonth() && apt.status === 'completed';
      });

      const monthRevenue = thisMonth.reduce((sum, apt) => sum + (apt.price || 0), 0);

      return `💰 **Financial Overview**\n\nTotal Revenue: $${totalRevenue.toLocaleString()}\nThis Month: $${monthRevenue.toLocaleString()}\nAppointments This Month: ${thisMonth.length}\n\nYou're averaging $${Math.round(monthRevenue / Math.max(thisMonth.length, 1))} per appointment this month. ${monthRevenue > 0 ? 'Great work! 🎉' : 'Let\'s work on filling your schedule.'}`;
    }

    // Appointment queries
    if (input.includes('today') || input.includes('appointment')) {
      const today = new Date();
      const todayApts = appointments.filter(apt => {
        const aptDate = new Date(apt.start_time);
        return aptDate.toDateString() === today.toDateString();
      });

      if (todayApts.length === 0) {
        return '📅 You have no appointments scheduled for today. Would you like me to help you find clients to contact?';
      }

      return `📅 **Today's Schedule**\n\nYou have ${todayApts.length} appointment${todayApts.length > 1 ? 's' : ''} today:\n\n${todayApts.map((apt, i) =>
        `${i + 1}. ${new Date(apt.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${apt.client?.name || 'Client'}\n   ${apt.title}`
      ).join('\n')}`;
    }

    // Client analysis
    if (input.includes('client') || input.includes('customer')) {
      const totalClients = clients.length;
      const activeClients = clients.filter(client => {
        const clientApts = appointments.filter(apt => apt.client?.id === client.id);
        if (clientApts.length === 0) return false;
        const lastApt = new Date(Math.max(...clientApts.map(apt => new Date(apt.end_time).getTime())));
        const daysSince = Math.floor((Date.now() - lastApt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince <= 30;
      }).length;

      const needFollowUp = clients.filter(client => {
        const clientApts = appointments.filter(apt => apt.client?.id === client.id);
        if (clientApts.length === 0) return false;
        const lastApt = new Date(Math.max(...clientApts.map(apt => new Date(apt.end_time).getTime())));
        const daysSince = Math.floor((Date.now() - lastApt.getTime()) / (1000 * 60 * 60 * 24));
        return daysSince > 30;
      });

      return `👥 **Client Insights**\n\nTotal Clients: ${totalClients}\nActive (last 30 days): ${activeClients}\nNeed Follow-up: ${needFollowUp.length}\n\n${needFollowUp.length > 0 ? `⚠️ ${needFollowUp.length} clients haven't booked in over 30 days. I recommend reaching out to:\n\n${needFollowUp.slice(0, 3).map((c, i) => `${i + 1}. ${c.name}`).join('\n')}` : '✅ All clients are engaged!'}`;
    }

    // Marketing help
    if (input.includes('market') || input.includes('message') || input.includes('email') || input.includes('campaign')) {
      return `📢 **Marketing Assistant**\n\nI can help you create:\n\n• Promotional messages for slow periods\n• Re-engagement campaigns for inactive clients\n• Seasonal offers and announcements\n• Review requests after appointments\n• Referral program invitations\n\nWhat type of message would you like me to draft?`;
    }

    // Insights and recommendations
    if (input.includes('insight') || input.includes('recommend') || input.includes('suggest') || input.includes('improve')) {
      const gaps = appointments.filter(apt => apt.is_gap);
      const completionRate = appointments.length > 0
        ? (appointments.filter(apt => apt.status === 'completed').length / appointments.length) * 100
        : 0;

      return `💡 **Business Insights & Recommendations**\n\n1. **Schedule Optimization**\n   ${gaps.length > 0 ? `You have ${gaps.length} gap${gaps.length > 1 ? 's' : ''} in your schedule. Use Smart Gap Filling to contact relevant clients.` : '✅ Your schedule is well-optimized.'}\n\n2. **Client Retention**\n   Track clients who haven't booked in 21+ days and send friendly check-ins.\n\n3. **Revenue Growth**\n   ${completionRate.toFixed(0)}% appointment completion rate. ${completionRate < 80 ? 'Consider sending reminders to reduce no-shows.' : '🎉 Excellent completion rate!'}\n\n4. **Marketing**\n   Run monthly campaigns to keep clients engaged and boost bookings.`;
    }

    // Help queries
    if (input.includes('help') || input.includes('how') || input.includes('what')) {
      return `🤔 **I'm here to help!**\n\nHere are some things you can ask me:\n\n• "Show my revenue this month"\n• "Which clients need follow-up?"\n• "What are my appointments today?"\n• "Help me write a promotional message"\n• "Give me business insights"\n• "Find gaps in my schedule"\n\nYou can also navigate the app - try "Go to clients" or "Open calendar"`;
    }

    // Navigation
    if (input.includes('go to') || input.includes('open') || input.includes('show')) {
      if (input.includes('client')) {
        navigate('/app/clients');
        return '✅ Opening Clients page...';
      }
      if (input.includes('calendar') || input.includes('schedule')) {
        navigate('/app/calendar');
        return '✅ Opening Calendar...';
      }
      if (input.includes('message') || input.includes('conversation')) {
        navigate('/app/conversations');
        return '✅ Opening Messages...';
      }
      if (input.includes('payment') || input.includes('invoice')) {
        navigate('/app/payments');
        return '✅ Opening Payments...';
      }
      if (input.includes('dashboard')) {
        navigate('/app/dashboard');
        return '✅ Opening Dashboard...';
      }
    }

    // Default response
    return `I understand you're asking about "${userInput}". \n\nI can help with:\n• Business analytics and insights\n• Client management suggestions\n• Revenue tracking\n• Appointment scheduling tips\n• Marketing message creation\n\nCould you be more specific about what you'd like to know?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = analyzeIntent(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        suggestions: getSuggestions(input),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const getSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();

    if (input.includes('revenue') || input.includes('money')) {
      return ['Show client spending trends', 'Predict next month revenue', 'Compare to last month'];
    }

    if (input.includes('client')) {
      return ['Find high-value clients', 'Export client list', 'Send bulk message'];
    }

    if (input.includes('today') || input.includes('appointment')) {
      return ['Show tomorrow\'s schedule', 'Find gaps this week', 'View monthly calendar'];
    }

    return ['Analyze my business', 'Show revenue', 'Find overdue clients', 'Marketing ideas'];
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 animate-pulse"
        title="AI Assistant"
      >
        <Sparkles className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Assistant</h3>
            <p className="text-purple-100 text-xs">Powered by Smart Analytics</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Context Bar */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 border-b border-purple-100 text-xs text-purple-700">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {clients.length} clients
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {appointments.filter(apt => !apt.is_gap).length} appointments
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            AI Active
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white border-2 border-purple-100 text-slate-900'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                </div>
              )}

              <div className="whitespace-pre-line text-sm leading-relaxed">
                {message.content}
              </div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-100 space-y-2">
                  <p className="text-xs font-semibold text-purple-600 mb-2">💡 Quick suggestions:</p>
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(suggestion)}
                      className="block w-full text-left px-3 py-2 text-xs bg-purple-50 hover:bg-purple-100 rounded-lg transition text-purple-700 font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-purple-100' : 'text-slate-400'}`}>
                {message.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-purple-100 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-purple-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
