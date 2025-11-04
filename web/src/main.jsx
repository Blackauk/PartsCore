import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { ModalProvider } from './contexts/ModalContext.jsx'
import { AuthProvider as LegacyAuthProvider } from './contexts/AuthContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { bootstrapDataLayer } from './lib/data-migration.js'

// Router toggle: HashRouter for GitHub Pages, BrowserRouter for dev
// Detect GitHub Pages hostname OR use VITE_USE_HASH env var
const isGitHubPages = typeof window !== 'undefined' && window.location.host.endsWith('github.io')
const useHash = isGitHubPages || import.meta.env.VITE_USE_HASH === '1'
const RouterImpl = useHash ? HashRouter : BrowserRouter

// Only use basename with BrowserRouter (HashRouter doesn't need it)
const basename = !useHash ? (import.meta.env.BASE_URL || '/PartsCore/') : undefined

// Bootstrap data layer before rendering
bootstrapDataLayer().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <RouterImpl {...(basename ? { basename } : {})}>
        <AuthProvider>
          <LegacyAuthProvider>
            <SettingsProvider>
              <AppProvider>
                <ModalProvider>
                  <App />
                </ModalProvider>
              </AppProvider>
            </SettingsProvider>
          </LegacyAuthProvider>
        </AuthProvider>
      </RouterImpl>
    </StrictMode>,
  )
})
