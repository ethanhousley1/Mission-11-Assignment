import { useEffect, useRef, useState } from 'react'

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

const emptyForm: Omit<Book, 'bookId'> = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

type ModalMode = 'add' | 'edit' | null

function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [form, setForm] = useState<Omit<Book, 'bookId'>>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    if (successTimerRef.current) clearTimeout(successTimerRef.current)
    successTimerRef.current = setTimeout(() => setSuccessMsg(null), 3500)
  }

  const loadBooks = async (page = pageNumber, size = pageSize) => {
    setIsLoading(true)
    setPageError(null)
    try {
      const res = await fetch(`/api/books?pageNumber=${page}&pageSize=${size}&sortOrder=asc`)
      if (!res.ok) throw new Error(`Failed to load books (${res.status})`)
      const data = await res.json()
      setBooks(data.books)
      setTotalCount(data.totalCount)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBooks(pageNumber, pageSize)
  }, [pageNumber, pageSize])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // ── Modal helpers ──────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm)
    setFormError(null)
    setSelectedBook(null)
    setModalMode('add')
  }

  const openEdit = (book: Book) => {
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    })
    setFormError(null)
    setSelectedBook(book)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedBook(null)
    setFormError(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'pageCount' || name === 'price' ? Number(value) : value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setFormError(null)
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, bookId: 0 }),
        })
        if (!res.ok) throw new Error(`Could not add book (${res.status})`)
        flash(`"${form.title}" added.`)
      } else if (modalMode === 'edit' && selectedBook) {
        const res = await fetch(`/api/books/${selectedBook.bookId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, bookId: selectedBook.bookId }),
        })
        if (!res.ok) throw new Error(`Could not update book (${res.status})`)
        flash(`"${form.title}" updated.`)
      }
      closeModal()
      loadBooks(pageNumber, pageSize)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/books/${deleteTarget.bookId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Could not delete book (${res.status})`)
      flash(`"${deleteTarget.title}" deleted.`)
      setDeleteTarget(null)
      const newPage = books.length === 1 && pageNumber > 1 ? pageNumber - 1 : pageNumber
      setPageNumber(newPage)
      loadBooks(newPage, pageSize)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsDeleting(false)
    }
  }

  const textFields = ['title', 'author', 'publisher', 'isbn', 'classification', 'category'] as const

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h2 className="h5 mb-0">Admin — Books</h2>
            {!isLoading && <small className="text-muted">{totalCount} total books</small>}
          </div>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Book
          </button>
        </div>

        <div className="card-body">
          {successMsg && (
            <div className="alert alert-success alert-dismissible py-2 mb-3" role="alert">
              {successMsg}
              <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)} />
            </div>
          )}
          {pageError && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {pageError}
            </div>
          )}

          <div className="d-flex align-items-center gap-2 mb-3">
            <label className="form-label mb-0 text-nowrap">Per page:</label>
            <select
              className="form-select form-select-sm w-auto"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1) }}
              disabled={isLoading}
            >
              {[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-5 text-muted">Loading...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>ISBN</th>
                    <th className="text-end">Price</th>
                    <th className="text-center">Pages</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        No books found.
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book.bookId}>
                        <td className="fw-semibold">{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td><small className="text-muted">{book.isbn}</small></td>
                        <td className="text-end">${book.price.toFixed(2)}</td>
                        <td className="text-center">{book.pageCount}</td>
                        <td className="text-center text-nowrap">
                          <button
                            className="btn btn-outline-secondary btn-sm me-1"
                            onClick={() => openEdit(book)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => setDeleteTarget(book)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="card-footer">
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item${pageNumber === 1 || isLoading ? ' disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPageNumber((p) => p - 1)}>
                    &laquo; Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pageNumber) <= 2)
                  .map((p) => (
                    <li key={p} className={`page-item${p === pageNumber ? ' active' : ''}${isLoading ? ' disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPageNumber(p)}>{p}</button>
                    </li>
                  ))}
                <li className={`page-item${pageNumber >= totalPages || isLoading ? ' disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPageNumber((p) => p + 1)}>
                    Next &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ───────────────────────────────────── */}
      {modalMode !== null && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'add' ? 'Add New Book' : `Edit — ${selectedBook?.title}`}
                </h5>
                <button className="btn-close" onClick={closeModal} disabled={isSaving} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger py-2 mb-3">{formError}</div>
                  )}
                  <div className="alert alert-info py-2 mb-3">
                    All fields are required. Please fill in every field before saving.
                  </div>
                  <div className="row g-3">
                    {textFields.map((field) => (
                      <div className="col-12 col-sm-6" key={field}>
                        <label className="form-label text-capitalize fw-semibold">{field}</label>
                        <input
                          type="text"
                          className="form-control"
                          name={field}
                          value={form[field]}
                          onChange={handleFormChange}
                          required
                          disabled={isSaving}
                        />
                      </div>
                    ))}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold">Page Count</label>
                      <input
                        type="number"
                        className="form-control"
                        name="pageCount"
                        value={form.pageCount}
                        onChange={handleFormChange}
                        min={1}
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold">Price ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={form.price}
                        onChange={handleFormChange}
                        min={0}
                        step={0.01}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isSaving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving…' : modalMode === 'add' ? 'Add Book' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteTarget && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Book</h5>
                <button className="btn-close" onClick={() => setDeleteTarget(null)} disabled={isDeleting} />
              </div>
              <div className="modal-body">
                Are you sure you want to permanently delete{' '}
                <strong>"{deleteTarget.title}"</strong>?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminBooksPage
