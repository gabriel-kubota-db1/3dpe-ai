import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import ptBR from 'antd/locale/pt_BR';

const theme = {
  token: {
    colorPrimary: '#1B4B71',
    borderRadius: 6,
  },
};

export const AntdThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider locale={ptBR} theme={theme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};
