import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { ModalProvider } from './contexts/ModalContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { bootstrapDataLayer } from './lib/data-migration.js'

// Router toggle: HashRouter for production (GitHub Pages), BrowserRouter for dev
// Set VITE_USE_HASH=1 in production build, VITE_USE_HASH=0 for development
const useHash = import.meta.env.VITE_USE_HASH === '1'
const RouterImpl = useHash ? HashRouter : BrowserRouter

// Only use basename with BrowserRouter (HashRouter doesn't need it)
const basename = !useHash ? (import.meta.env.BASE_URL || '/PartsCore/') : undefined

// Bootstrap data layer before rendering
bootstrapDataLayer().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <RouterImpl {...(basename ? { basename } : {})}>
        <AuthProvider>
          <AppProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </AppProvider>
        </AuthProvider>
      </RouterImpl>
    </StrictMode>,
  )
})
