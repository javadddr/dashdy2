import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {HeroUIProvider} from '@heroui/react'
import './index.css'
import App from './App.jsx'
import { GlobalProvider } from "./GlobalProvider";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
    <GlobalProvider>
    <App />
    </GlobalProvider>
    </HeroUIProvider>
    
  </StrictMode>,
)
