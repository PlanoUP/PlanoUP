import '@fontsource-variable/inter'
import '@fontsource-variable/inter-tight'
import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { captureAttribution } from './lib/attribution'

// Origem da visita (UTMs/referrer) registrada na chegada, antes de qualquer navegação interna.
captureAttribution()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
