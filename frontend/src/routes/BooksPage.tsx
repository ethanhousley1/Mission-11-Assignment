import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api } from '../api'
import BookList from '../components/BookList'
import type { AppContext } from '../App'

function BooksPage() {
  const { addToCart, isAddingToCart, isRemovingFromCart } = useOutletContext<AppContext>()

  const [books, setBooks] = useState<AppContext['books']>([])
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await api(`/api/books?pageNumber=${pageNumber}&pageSize=${pageSize}&sortOrder=${sortOrder}`)

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json()
        setBooks(data.books)
        setTotalCount(data.totalCount)
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
    <div className="card shadow-sm">
      <div className="card-body">
        <div>
          <h1 className="h3 mb-1">Bookstore Frontend</h1>
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
          <div className="col-12 col-md-4 col-lg-12 col-xl-4">
            <nav aria-label="Page navigation">
              <ul className="pagination mb-0">
                <li className={`page-item${pageNumber === 1 || isLoading ? ' disabled' : ''}`}>
                  <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (pageNumber > 1 && !isLoading) setPageNumber((p) => p - 1) }}>
                    Previous
                  </a>
                </li>
                {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pageNumber) <= 2)
                  .map((p) => (
                    <li key={p} className={`page-item${p === pageNumber ? ' active' : ''}${isLoading ? ' disabled' : ''}`}>
                      <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (!isLoading) setPageNumber(p) }}>
                        {p}
                      </a>
                    </li>
                  ))}
                <li className={`page-item${isLoading || pageNumber >= Math.ceil(totalCount / pageSize) ? ' disabled' : ''}`}>
                  <a className="page-link" href="#" onClick={(e) => { e.preventDefault(); if (!isLoading && pageNumber < Math.ceil(totalCount / pageSize)) setPageNumber((p) => p + 1) }}>
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
            onAddToCart={(bookId) => addToCart(bookId, books)}
            isAddingToCart={isAddingToCart || isRemovingFromCart}
          />
        )}

        {!isLoading && books.length === 0 && !error && (
          <div className="alert alert-secondary mb-0">No books found for this page.</div>
        )}
      </div>
    </div>
  )
}

export default BooksPage
