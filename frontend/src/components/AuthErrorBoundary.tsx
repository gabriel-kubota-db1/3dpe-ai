import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    // Clear any stored tokens and reload
    localStorage.clear();
    window.location.replace('/login');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Authentication Error"
          subTitle="Something went wrong with authentication. Please try logging in again."
          extra={[
            <Button type="primary" key="retry" onClick={this.handleRetry}>
              Go to Login
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
