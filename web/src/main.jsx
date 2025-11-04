import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ModalProvider } from './contexts/ModalContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { bootstrapDataLayer } from './lib/data-migration.js'

// Bootstrap data layer before rendering
bootstrapDataLayer().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <AppProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </AppProvider>
      </AuthProvider>
    </StrictMode>,
  )
})
