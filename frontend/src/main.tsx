import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'
import BooksPage from './routes/BooksPage.tsx'
import CartPage from './routes/CartPage.tsx'
import AdminBooksPage from './routes/AdminBooksPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="adminbooks" element={<AdminBooksPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
