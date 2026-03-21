using BooktoreBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BooktoreBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController(BookstoreContext db) : ControllerBase
{
    [HttpGet]
    public IActionResult GetBooks(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortOrder = "asc")
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 50);
        sortOrder = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc";

        var query = db.Books.AsQueryable();

        query = sortOrder == "desc"
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var books = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(books);
    }
}
