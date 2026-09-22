import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import { sampleBooks } from "@/lib/constants";
import { getAllBooks } from "@/lib/actions/book.actions";

/** Renders stored books, or an empty library when loading returns a failure. */
export default async function Home() {
    const bookResults = await getAllBooks();
    const books = bookResults.success ? bookResults.books ?? [] : [];
    console.log(books);

  return (
    <main className="wrapper container">
      <HeroSection />
      <div className="library-books-grid">
        {books.map((book) => (
          <BookCard
            key={book._id}
            title={book.title}
            author={book.author}
            coverURL={book.coverURL}
            slug={book.slug}
          />
        ))}
      </div>
    </main>
  );
}
