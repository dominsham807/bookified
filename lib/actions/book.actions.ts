"use server";
import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "@/lib/utils";
import { Book } from "@/database/models/book.model";
import { BookSegment } from "@/database/models/book-segment.model";

/** Returns all books newest first, or a failure result if the query fails. */
export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const books = await Book.find().sort({ createdAt: -1 }).lean();

        return {
            success: true,
            books: serializeData(books),
        }
    } catch (e) {
        console.error('Error connecting to database', e);
        return {
            success: false,
            error: e,
        }
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        await connectToDatabase();

        const book = await Book.findOne({ slug }).lean();

        if (!book) {
            return {
                success: false,
                data: null,
            };
        }

        return {
            success: true,
            data: serializeData(book),
        };
    } catch (e) {
        console.error("Error fetching book by slug", e);
        return {
            success: false,
            data: null,
            error: e,
        };
    }
};

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);

        const existingBook = await Book.findOne({ slug }).lean();

        if(existingBook) {
            return {
                exists: true, book: serializeData(existingBook)
            }
        }

        return {
            exists: false
        }
    } catch (e) {
        console.error(e);
        return {
            exists: false
        };
    }
}

/**
 * Creates a book with a title-derived slug, or returns the existing book that
 * already uses that slug. Database errors are returned as failure results.
 */
export const createBook = async (data: CreateBook) => {
  try {
    await connectToDatabase();
    // Add logic to create a book in the database here
    const slug = generateSlug(data.title);

    const existingBook = await Book.findOne({ slug }).lean();

    if (existingBook) {
      return {
        success: true,
        data: serializeData(existingBook),
        alreadyExists: true,
      };
    }

    // Todo: Check subscription limits before creating a book
    const book = await Book.create({ ...data, slug, totalSegments: 0 });

    return {
      success: true,
      data: serializeData(book),
    };
  } catch (e) {
    console.error("Error creating a book", e);
    return {
      success: false,
      error: e,
    };
  }
};

/**
 * Persists parsed segments and updates the book's segment count.
 * If either operation fails, cleanup attempts to delete the book and its
 * segments. Cleanup errors propagate instead of being converted to a result.
 */
export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();

        console.log('Saving book segments...');

        const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
            clerkId, 
            bookId,
            content: text,
            segmentIndex,
            pageNumber,
            wordCount,
        }));

        await BookSegment.insertMany(segmentsToInsert);

        await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length })

        console.log('Book segments saved successfully');

        return {
            success: true,
            data: {
                segmentsCreated: segments.length
            }
        }
    } catch (e) {
        console.error("Error saving book segments", e);

        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete(bookId);
        console.log('Deleted book segments and book due to failure to save segments');
        return {
            success: false,
            error: e,
        }
    }
}