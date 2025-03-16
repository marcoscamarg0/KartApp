import React from 'react';
import { AuthProvider } from './src/app/funçoes/AuthContext';
import Routes from './src/app/routes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
};

export default App;