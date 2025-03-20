import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Redux
import { Provider } from 'react-redux';
import store from './store/index.js';

// Context
import { AuthProvider } from './context/AuthContext.jsx'
import { Loader } from './components/shared/Loader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
        <AuthProvider>
          <Loader />
          <App />
        </AuthProvider>
      </Provider>
    </Router>
  </StrictMode>,
)
