import React from 'react';

export default function ErrorBoundary({ children, fallback }) {
  return children;
}

export class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-primary mb-2">Something went wrong</h1>
            <p className="text-gray-600 text-sm mb-6">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                Refresh page
              </button>
              {this.props.onReset && (
                <button
                  type="button"
                  onClick={() => { this.setState({ hasError: false, error: null }); this.props.onReset?.(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
