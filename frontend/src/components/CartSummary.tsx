type CartItem = {
  bookId: number
  title: string
  quantity: number
  price: number
  subtotal: number
}

type CartSummaryProps = {
  items: CartItem[]
  total: number
  showActions?: boolean
  onContinueShopping?: () => void
  onRemoveOne?: (bookId: number) => void
  onRemoveAll?: (bookId: number) => void
  isUpdatingCart?: boolean
}

function CartSummary({
  items,
  total,
  showActions = false,
  onContinueShopping,
  onRemoveOne,
  onRemoveAll,
  isUpdatingCart = false,
}: CartSummaryProps) {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Session Cart</h2>
          {showActions && onContinueShopping && (
            <button className="btn btn-outline-primary btn-sm" onClick={onContinueShopping}>
              Continue Shopping
            </button>
          )}
        </div>
        {items.length === 0 && <div className="alert alert-secondary mb-0">Your cart is empty.</div>}
        {items.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Book</th>
                <th className="text-end">Qty</th>
                <th className="text-end">Price</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.bookId}>
                  <td>{item.title}</td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">${item.price.toFixed(2)}</td>
                  <td className="text-end">${item.subtotal.toFixed(2)}</td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => onRemoveOne?.(item.bookId)}
                        disabled={isUpdatingCart}
                      >
                        -1
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => onRemoveAll?.(item.bookId)}
                        disabled={isUpdatingCart}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={4} className="text-end">
                  Total
                </th>
                <th className="text-end">${total.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}

export default CartSummary
