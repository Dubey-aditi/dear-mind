import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// The fonts ship with the app instead of being fetched from Google. That's
// what makes them work offline — a <link> to fonts.googleapis.com is a network
// request, and a network request is exactly what we won't have. Importing them
// here lets Vite bundle the .woff2 files so the service worker can cache them.
// "latin-" prefixes pull only the Latin subset; Poppins also ships Devanagari,
// which we'd otherwise download for nothing.
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/poppins/latin-300.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'

import App from './App.tsx'
import './index.css'

// This is the single place where React "takes over" a piece of the page.
// It finds <div id="root"> in index.html and renders <App /> inside it.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
