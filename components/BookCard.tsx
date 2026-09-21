import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookCardProps } from "@/types";

const BookCard: React.FC<BookCardProps> = ({ title, author, coverURL, slug }) => {
    return (
        <Link href={`/books/${slug}`}>
            <article className="book-card">
                <figure className="book-card-figure">
                    <div className="book-card-cover-wrapper">
                        <Image
                            src={coverURL}
                            alt={`Cover of ${title}`}
                            className="book-card-cover"
                            width={133}
                            height={200}
                        />
                    </div>
                </figure>
                <figcaption className="book-card-meta">
                    <h3 className="book-card-title">{title}</h3>
                    <p className="book-card-author">{author}</p>
                </figcaption>
            </article>
        </Link>
    );
};

export default BookCard;