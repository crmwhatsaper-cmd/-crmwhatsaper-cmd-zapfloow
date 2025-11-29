import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handler for script loading errors or immediate crashes
window.onerror = function(message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root && (!root.innerHTML || root.innerHTML === '')) {
     root.innerHTML = `
        <div style="font-family: sans-serif; padding: 20px; text-align: center; color: #333;">
            <h1 style="color: #e11d48;">Erro de Inicialização</h1>
            <p>Ocorreu um erro ao carregar o aplicativo.</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px auto; max-width: 600px; text-align: left; overflow: auto; font-family: monospace; font-size: 12px; color: #475569;">
                <strong>Error:</strong> ${message}<br/>
                <small>${source}:${lineno}</small>
            </div>
            <button onclick="window.location.reload()" style="background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Tentar Novamente</button>
        </div>
     `;
  }
};

// Catch Unhandled Promise Rejections (common with Import Maps/Network errors)
window.onunhandledrejection = function(event) {
    console.error("Unhandled rejection:", event.reason);
    const root = document.getElementById('root');
    if (root && (!root.innerHTML || root.innerHTML === '')) {
        root.innerHTML = `
            <div style="font-family: sans-serif; padding: 20px; text-align: center; color: #333;">
                <h1 style="color: #e11d48;">Erro de Rede ou Carregamento</h1>
                <p>Falha ao carregar recursos essenciais (Provavelmente CDN bloqueada ou erro de importação).</p>
                <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px auto; max-width: 600px; text-align: left; overflow: auto; font-family: monospace; font-size: 12px; color: #475569;">
                    ${event.reason ? event.reason.toString() : 'Erro desconhecido na promessa'}
                </div>
                <button onclick="window.location.reload()" style="background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Tentar Novamente</button>
            </div>
        `;
    }
};

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary to catch runtime crashes (like env var issues)
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50 flex-col p-4 text-center font-sans">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Ocorreu um erro.</h1>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            O aplicativo encontrou um erro inesperado durante a execução.
          </p>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-left w-full max-w-lg overflow-auto text-xs font-mono shadow-sm">
            {this.state.error?.message || "Erro desconhecido"}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-slate-850 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors shadow-md"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);