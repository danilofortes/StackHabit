import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Armazena a raiz globalmente para evitar recriação no HMR
declare global {
  interface Window {
    __reactRoot?: ReturnType<typeof createRoot>;
  }
}

// Reutiliza a raiz existente ou cria uma nova
if (!window.__reactRoot) {
  window.__reactRoot = createRoot(rootElement)
}

window.__reactRoot.render(
  <StrictMode>
    <App />
  </StrictMode>
)
