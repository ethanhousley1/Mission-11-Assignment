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

type BookListProps = {
  books: Book[]
  onAddToCart: (bookId: number) => void
  isAddingToCart: boolean
}

function BookList({ books, onAddToCart, isAddingToCart }: BookListProps) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Category</th>
            <th className="text-end">Price</th>
            <th className="text-end">Cart</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.bookId}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.category}</td>
              <td className="text-end">${book.price.toFixed(2)}</td>
              <td className="text-end">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => onAddToCart(book.bookId)}
                  disabled={isAddingToCart}
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BookList
