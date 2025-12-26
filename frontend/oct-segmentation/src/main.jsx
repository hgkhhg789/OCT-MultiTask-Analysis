import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './ThemeContext.jsx'
import { PatientProvider } from './context/PatientContext.jsx' // <--- Thêm dòng này

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <PatientProvider> {/* <--- Bọc PatientProvider ở đây */}
        <App />
      </PatientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)