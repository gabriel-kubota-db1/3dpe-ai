import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { AntdThemeProvider } from './AntdThemeProvider';
import { ReactQueryProvider } from './ReactQueryProvider';

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <AntdThemeProvider>{children}</AntdThemeProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
};

export default AppProviders;
