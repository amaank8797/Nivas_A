import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contextApi/AuthProvider';
import { SidebarProvider } from './contextApi/sidebar/SideBarProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SidebarProvider>
        <Toaster />
        <App />
      </SidebarProvider>
    </AuthProvider>
  </React.StrictMode>
);
