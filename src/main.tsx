import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const dsn = import.meta.env.VITE_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ErrorFallback() {
  return (
    <div className="bg-[#0C0D12] min-h-screen flex items-center justify-center text-white font-sans p-6">
      <div className="bg-white/5 border border-white/10 p-1.5 rounded-[2.2rem] shadow-xl max-w-sm w-full">
        <div className="bg-[#13141C] border border-neutral-800/30 rounded-[calc(2.2rem-0.375rem)] p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/>
              <line x1="12" x2="12" y1="9" y2="13"/>
              <line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>
          </div>
          <h3 className="font-extrabold text-xl text-white">Something went wrong</h3>
          <p className="text-neutral-400 text-xs leading-relaxed font-medium">
            An unexpected error occurred. Please reload the application to continue.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-3.5 rounded-2xl active:scale-95 transition-transform text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20"
          >
            Reload App
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
