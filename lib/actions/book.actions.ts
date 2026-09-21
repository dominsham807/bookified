"use server";
import { CreateBook, TextSegment } from "@/types";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "@/lib/utils";
import { Book } from "@/database/models/book.model";

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

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[]) => {

}