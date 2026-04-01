using BooktoreBackend.Data;
using BooktoreBackend.Models;
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

        var totalCount = query.Count();

        var books = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new { books, totalCount });
    }

    [HttpGet("{id}")]
    public IActionResult GetBook(int id)
    {
        var book = db.Books.Find(id);
        if (book is null) return NotFound();
        return Ok(book);
    }

    [HttpPost]
    public IActionResult AddBook([FromBody] Book book)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        book.BookId = 0; // let the DB assign the ID
        db.Books.Add(book);
        db.SaveChanges();

        return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateBook(int id, [FromBody] Book book)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (id != book.BookId) return BadRequest("ID in URL does not match body.");

        var existing = db.Books.Find(id);
        if (existing is null) return NotFound();

        existing.Title = book.Title;
        existing.Author = book.Author;
        existing.Publisher = book.Publisher;
        existing.Isbn = book.Isbn;
        existing.Classification = book.Classification;
        existing.Category = book.Category;
        existing.PageCount = book.PageCount;
        existing.Price = book.Price;

        db.SaveChanges();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteBook(int id)
    {
        var book = db.Books.Find(id);
        if (book is null) return NotFound();

        db.Books.Remove(book);
        db.SaveChanges();
        return NoContent();
    }
}
