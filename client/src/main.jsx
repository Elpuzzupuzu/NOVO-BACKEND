// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux'; // Importa Provider
import store from './store'; // Importa tu store

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}> {/* Envuelve App con Provider */}
      <App />
    </Provider>
  </React.StrictMode>,
);