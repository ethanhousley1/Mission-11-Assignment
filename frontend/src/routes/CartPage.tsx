import { useOutletContext } from 'react-router-dom'
import type { AppContext } from '../App'

function CartPage() {
  const { cartAlert, setCartAlert } = useOutletContext<AppContext>()

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h4 mb-2">Cart View</h2>
        {cartAlert && (
          <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
            {cartAlert}
            <button type="button" className="btn-close" onClick={() => setCartAlert(null)} aria-label="Close"></button>
          </div>
        )}
        <p className="text-muted mb-0">
          Use the Continue Shopping button in the cart summary to go back to browsing.
        </p>
      </div>
    </div>
  )
}

export default CartPage
