import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './ui/styles/global.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<App />);
} else {
  console.error("Elemento root não encontrado!");
}