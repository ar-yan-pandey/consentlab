'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function toast(type: Toast['type'], message: string) {
  useToastStore.getState().addToast(type, message);
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-lg shadow-lg animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
          {toast.type === 'error' && (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          {toast.type === 'info' && (
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          )}
          <p
            className={`flex-1 text-sm font-medium ${
              toast.type === 'success'
                ? 'text-green-900'
                : toast.type === 'error'
                ? 'text-red-900'
                : 'text-blue-900'
            }`}
          >
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
