import { useEffect, useState } from 'react'
import './App.css'
import BookList from './components/BookList'

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

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(false)

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
    <main className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h1 className="h3 mb-1">Bookstore Frontend</h1>
          <p className="text-muted mb-4">Books from backend API</p>

          <div className="d-flex flex-wrap gap-3 align-items-end mb-3">
            <div>
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
            <div>
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

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1 || isLoading}
              >
                Previous
              </button>
              <span className="badge text-bg-light border">Page {pageNumber}</span>
              <button
                className="btn btn-primary"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={isLoading || books.length < pageSize}
              >
                Next
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">Error: {error}</div>}
          {isLoading && <div className="alert alert-info">Loading...</div>}

          {!isLoading && books.length > 0 && <BookList books={books} />}

          {!isLoading && books.length === 0 && !error && (
            <div className="alert alert-secondary mb-0">No books found for this page.</div>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
