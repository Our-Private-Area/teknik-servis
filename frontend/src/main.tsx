import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

/* Set initial theme */
const savedTheme = localStorage.getItem('teknikpro-theme');
const theme = savedTheme ? JSON.parse(savedTheme).state?.theme || 'dark' : 'dark';
document.documentElement.setAttribute('data-theme', theme);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
