import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrandProvider } from './contexts/BrandContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrandProvider>
        <App />
      </BrandProvider>
    </HelmetProvider>
  </StrictMode>,
);
