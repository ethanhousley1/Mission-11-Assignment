using BooktoreBackend.Data;
using BooktoreBackend.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace BooktoreBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController(BookstoreContext db) : ControllerBase
{
    private const string CartSessionKey = "Cart";

    [HttpGet]
    public IActionResult GetCart()
    {
        var cart = GetSessionCart();
        return Ok(BuildCartResponse(cart));
    }

    [HttpPost("add")]
    public IActionResult AddToCart([FromBody] AddToCartRequest request)
    {
        var quantityToAdd = Math.Max(1, request.Quantity);
        var bookExists = db.Books.Any(b => b.BookId == request.BookId);

        if (!bookExists)
        {
            return NotFound($"Book with id {request.BookId} not found.");
        }

        var cart = GetSessionCart();
        var existingItem = cart.FirstOrDefault(i => i.BookId == request.BookId);

        if (existingItem is null)
        {
            cart.Add(new CartSessionItem
            {
                BookId = request.BookId,
                Quantity = quantityToAdd
            });
        }
        else
        {
            existingItem.Quantity += quantityToAdd;
        }

        HttpContext.Session.SetAsJson(CartSessionKey, cart);

        return Ok(BuildCartResponse(cart));
    }

    [HttpPost("remove")]
    public IActionResult RemoveFromCart([FromBody] RemoveFromCartRequest request)
    {
        var quantityToRemove = Math.Max(1, request.Quantity);
        var cart = GetSessionCart();
        var existingItem = cart.FirstOrDefault(i => i.BookId == request.BookId);

        if (existingItem is null)
        {
            return Ok(BuildCartResponse(cart));
        }

        if (request.RemoveAll)
        {
            cart.Remove(existingItem);
        }
        else
        {
            existingItem.Quantity -= quantityToRemove;
            if (existingItem.Quantity <= 0)
            {
                cart.Remove(existingItem);
            }
        }

        HttpContext.Session.SetAsJson(CartSessionKey, cart);

        return Ok(BuildCartResponse(cart));
    }

    private List<CartSessionItem> GetSessionCart()
    {
        return HttpContext.Session.GetFromJson<List<CartSessionItem>>(CartSessionKey) ?? [];
    }

    private CartResponseDto BuildCartResponse(List<CartSessionItem> cart)
    {
        var bookIds = cart.Select(i => i.BookId).ToList();

        var books = db.Books
            .Where(b => bookIds.Contains(b.BookId))
            .ToDictionary(b => b.BookId);

        var items = cart
            .Where(i => books.ContainsKey(i.BookId))
            .Select(i =>
            {
                var book = books[i.BookId];
                var subtotal = i.Quantity * book.Price;

                return new CartItemDto
                {
                    BookId = book.BookId,
                    Title = book.Title,
                    Quantity = i.Quantity,
                    Price = book.Price,
                    Subtotal = subtotal
                };
            })
            .ToList();

        return new CartResponseDto
        {
            Items = items,
            Total = items.Sum(i => i.Subtotal)
        };
    }

    private sealed class CartSessionItem
    {
        public int BookId { get; set; }
        public int Quantity { get; set; }
    }

    private sealed class CartItemDto
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public double Price { get; set; }
        public double Subtotal { get; set; }
    }

    private sealed class CartResponseDto
    {
        public List<CartItemDto> Items { get; set; } = [];
        public double Total { get; set; }
    }

    public sealed class AddToCartRequest
    {
        public int BookId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public sealed class RemoveFromCartRequest
    {
        public int BookId { get; set; }
        public int Quantity { get; set; } = 1;
        public bool RemoveAll { get; set; }
    }
}
