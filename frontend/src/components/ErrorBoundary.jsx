import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-lg p-6 text-center">
            <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-4 text-left text-xs text-gray-500 overflow-auto bg-gray-50 rounded-lg p-3 border border-gray-100">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
