import { useEffect, useRef, useState } from 'react'
import './App.css'
import BookList from './components/BookList'
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

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [cart, setCart] = useState<CartResponse>({ items: [], total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [view, setView] = useState<'books' | 'cart'>('books')
  const [isLoading, setIsLoading] = useState(false)
  const [isCartLoading, setIsCartLoading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false)
  const [cartAlert, setCartAlert] = useState<string | null>(null) // cart alert state
  const cartAlertTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const addToCart = async (bookId: number) => {
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
      setCartAlert(`"${book?.title ?? 'Book'}" added to cart!`) // cart alert message!
      cartAlertTimer.current = setTimeout(() => setCartAlert(null), 3000)
      setView('cart')
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

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/books?pageNumber=${pageNumber}&pageSize=${pageSize}&sortOrder=${sortOrder}`)

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = (await response.json()) as Book[]
        setBooks(data)
      } catch (err) {
        setBooks([])
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadBooks()
  }, [pageNumber, pageSize, sortOrder])

  return (
    <main className="container-fluid py-4">
      {/* cart alert starts here */}
      {cartAlert && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {cartAlert}
          <button type="button" className="btn-close" onClick={() => setCartAlert(null)} aria-label="Close"></button>
        </div>
      )}
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          {isCartLoading && <div className="alert alert-info">Loading cart...</div>}
          {cartError && <div className="alert alert-danger">Cart error: {cartError}</div>}
          {!isCartLoading && !cartError && (
            <CartSummary
              items={cart.items}
              total={cart.total}
              showActions={view === 'cart'}
              onContinueShopping={() => setView('books')}
              onRemoveOne={(bookId) => removeFromCart(bookId, false)}
              onRemoveAll={(bookId) => removeFromCart(bookId, true)}
              isUpdatingCart={isAddingToCart || isRemovingFromCart}
            />
          )}
        </div>

        <div className="col-12 col-lg-8">
          {view === 'books' && (
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h1 className="h3 mb-1">Bookstore Frontend</h1>
                  <button className="btn btn-outline-dark btn-sm" onClick={() => setView('cart')}>
                    View Cart ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})
                  </button>
                </div>
                <p className="text-muted mb-4">Books from backend API</p>

                <div className="row g-3 align-items-end mb-3">
                  <div className="col-12 col-md-4 col-lg-12 col-xl-4">
                    <label htmlFor="page-size" className="form-label mb-1">
                      Results per page
                    </label>
                    <select
                      id="page-size"
                      className="form-select"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value))
                        setPageNumber(1)
                      }}
                      disabled={isLoading}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4 col-lg-12 col-xl-4">
                    <label htmlFor="sort-order" className="form-label mb-1">
                      Sort by title
                    </label>
                    <select
                      id="sort-order"
                      className="form-select"
                      value={sortOrder}
                      onChange={(e) => {
                        setSortOrder(e.target.value as 'asc' | 'desc')
                        setPageNumber(1)
                      }}
                      disabled={isLoading}
                    >
                      <option value="asc">A to Z</option>
                      <option value="desc">Z to A</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4 col-lg-12 col-xl-4"> {/* Pagination controls start here */}
                    <nav aria-label="Page navigation"> 
                      <ul className="pagination mb-0">
                        <li className={`page-item${pageNumber === 1 || isLoading ? ' disabled' : ''}`}>
                          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (pageNumber > 1 && !isLoading) setPageNumber((p) => p - 1) }}>
                            Previous
                          </a>
                        </li>
                        {Array.from({ length: Math.min(pageNumber + (books.length >= pageSize ? 1 : 0), Math.max(pageNumber, 3)) }, (_, i) => i + 1)
                          .filter((p) => p >= Math.max(1, pageNumber - 2))
                          .map((p) => (
                            <li key={p} className={`page-item${p === pageNumber ? ' active' : ''}${isLoading ? ' disabled' : ''}`}>
                              <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (!isLoading) setPageNumber(p) }}>
                                {p}
                              </a>
                            </li>
                          ))}
                        <li className={`page-item${isLoading || books.length < pageSize ? ' disabled' : ''}`}>
                          <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (!isLoading && books.length >= pageSize) setPageNumber((p) => p + 1) }}>
                            Next
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>

                {error && <div className="alert alert-danger">Error: {error}</div>}
                {isLoading && <div className="alert alert-info">Loading...</div>}

                {!isLoading && books.length > 0 && (
                  <BookList
                    books={books}
                    onAddToCart={addToCart}
                    isAddingToCart={isAddingToCart || isRemovingFromCart}
                  />
                )}

                {!isLoading && books.length === 0 && !error && (
                  <div className="alert alert-secondary mb-0">No books found for this page.</div>
                )}
              </div>
            </div>
          )}

          {view === 'cart' && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4 mb-2">Cart View</h2>
                <p className="text-muted mb-0">
                  Continue Shopping returns you to page {pageNumber} with your current filters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
