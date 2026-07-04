import React from 'react';
import Button from './ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="text-center max-w-sm">
            <span className="text-6xl">😵</span>
            <h2 className="text-xl font-bold text-gray-800 mt-4">出错了</h2>
            <p className="text-sm text-gray-500 mt-2">
              应用遇到了一个错误，请尝试重启
            </p>
            <p className="text-xs text-gray-400 mt-1 bg-gray-100 p-2 rounded-lg font-mono">
              {this.state.error?.message || '未知错误'}
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                🔄 重新加载
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
