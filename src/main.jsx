import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { setWasmUrl } from '@lottiefiles/dotlottie-react'
// Serve the dotLottie WASM locally instead of the jsdelivr CDN default.
import wasmUrl from '../node_modules/@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm?url'
import App from './App.jsx'
import './index.css'

setWasmUrl(wasmUrl)

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>,
)
