import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-emerald-500 to-green-600',
      textColor: 'text-white',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-500 to-rose-600',
      textColor: 'text-white',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
      textColor: 'text-white',
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      textColor: 'text-white',
    },
  };

  const { icon: Icon, bgColor, textColor } = config[toast.type];

  return (
    <div
      className={`${bgColor} ${textColor} rounded-xl shadow-2xl p-4 flex items-start gap-3 min-w-[320px] animate-slide-up backdrop-blur-sm`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 font-medium leading-relaxed">{toast.message}</p>
      <button
        onClick={onClose}
        className="hover:bg-white/20 rounded-lg p-1 transition flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
