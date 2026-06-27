import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useAuthStore } from './features/auth'
import './index.css'
import App from './app/App'

useAuthStore.getState()._init()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
