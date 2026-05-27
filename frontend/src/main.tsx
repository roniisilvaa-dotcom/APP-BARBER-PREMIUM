import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import App from './App.tsx'
import './index.css'

// Remove a tela de loading do HTML assim que o React montar
const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

// Chama a função global definida no index.html
if (typeof (window as Window & { __removeLoading?: () => void }).__removeLoading === 'function') {
  (window as Window & { __removeLoading?: () => void }).__removeLoading!()
}
