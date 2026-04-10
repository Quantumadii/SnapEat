import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '10px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#ff6b35', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc3545', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
)
