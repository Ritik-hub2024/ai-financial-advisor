import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './src/App.tsx';
import './src/index.css';
import { AuthProvider } from './src/context/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
