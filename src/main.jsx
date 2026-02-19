import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router"
import { router } from './router'
import './index.css'
import './utils/db/schema'
import { Toaster } from "@/components/ui/sonner"
import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './components/ui/theme-provider'
import { SecurityProvider } from './components/navigation/SecurityProvider'

// Enregistrement du Service Worker pour le support PWA
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="trackly-ui-theme">
      <SecurityProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SecurityProvider>
    </ThemeProvider>
  </StrictMode>,
)
