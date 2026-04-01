import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import CartSummary from './components/CartSummary'

type Book = {
  bookId: number
  title: string
  author: string
  publisher: string
  isbn: string
  classification: string
  category: string
  pageCount: number
  price: number
}

type CartItem = {
  bookId: number
  title: string
  quantity: number
  price: number
  subtotal: number
}

type CartResponse = {
  items: CartItem[]
  total: number
}

export type AppContext = {
  books: Book[]
  cart: CartResponse
  cartAlert: string | null
  setCartAlert: (msg: string | null) => void
  addToCart: (bookId: number, books: Book[]) => Promise<void>
  removeFromCart: (bookId: number, removeAll?: boolean) => Promise<void>
  isAddingToCart: boolean
  isRemovingFromCart: boolean
  cartError: string | null
}

function App() {
  const [cart, setCart] = useState<CartResponse>({ items: [], total: 0 })
  const [cartError, setCartError] = useState<string | null>(null)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false)
  const [cartAlert, setCartAlert] = useState<string | null>(null)
  const cartAlertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const isCartView = location.pathname === '/cart'

  const loadCart = async () => {
    try {
      setIsCartLoading(true)
      setCartError(null)

      const response = await fetch('/api/cart')
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = (await response.json()) as CartResponse
      setCart(data)
    } catch (err) {
      setCart({ items: [], total: 0 })
      setCartError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsCartLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const addToCart = async (bookId: number, books: Book[]) => {
    try {
      setIsAddingToCart(true)
      setCartError(null)

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = (await response.json()) as CartResponse
      setCart(data)
      const book = books.find((b) => b.bookId === bookId)
      if (cartAlertTimer.current) clearTimeout(cartAlertTimer.current)
      setCartAlert(`"${book?.title ?? 'Book'}" added to cart!`)
      cartAlertTimer.current = setTimeout(() => setCartAlert(null), 3000)
      navigate('/cart')
    } catch (err) {
      setCartError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const removeFromCart = async (bookId: number, removeAll = false) => {
    try {
      setIsRemovingFromCart(true)
      setCartError(null)

      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          quantity: 1,
          removeAll,
        }),
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = (await response.json()) as CartResponse
      setCart(data)
    } catch (err) {
      setCartError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsRemovingFromCart(false)
    }
  }

  const context: AppContext = {
    books: [],
    cart,
    cartAlert,
    setCartAlert,
    addToCart,
    removeFromCart,
    isAddingToCart,
    isRemovingFromCart,
    cartError,
  }

  return (
    <main className="container-fluid py-4">
      <nav className="mb-3 d-flex gap-3">
        <Link to="/books" className="text-decoration-none fw-semibold">Books</Link>
        <Link to="/cart" className="text-decoration-none fw-semibold">Cart</Link>
        <Link to="/adminbooks" className="text-decoration-none fw-semibold text-danger">Admin</Link>
      </nav>
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          {isCartLoading && <div className="alert alert-info">Loading cart...</div>}
          {cartError && <div className="alert alert-danger">Cart error: {cartError}</div>}
          {!isCartLoading && !cartError && (
            <CartSummary
              items={cart.items}
              total={cart.total}
              showActions={isCartView}
              onContinueShopping={() => navigate('/books')}
              onRemoveOne={(bookId) => removeFromCart(bookId, false)}
              onRemoveAll={(bookId) => removeFromCart(bookId, true)}
              isUpdatingCart={isAddingToCart || isRemovingFromCart}
            />
          )}
        </div>

        <div className="col-12 col-lg-8">
          <Outlet context={context} />
        </div>
      </div>
    </main>
  )
}

export default App
