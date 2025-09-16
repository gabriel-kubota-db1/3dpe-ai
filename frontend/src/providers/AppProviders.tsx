import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AntdThemeProvider } from './AntdThemeProvider';
import { ReactQueryProvider } from './ReactQueryProvider';
import TokenManager from '@/components/TokenManager';
import AuthErrorBoundary from '@/components/AuthErrorBoundary';

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthErrorBoundary>
      <ReactQueryProvider>
        <AuthProvider>
          <TokenManager />
          <AntdThemeProvider>{children}</AntdThemeProvider>
        </AuthProvider>
      </ReactQueryProvider>
    </AuthErrorBoundary>
  );
};

export default AppProviders;
