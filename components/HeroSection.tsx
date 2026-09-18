import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="library-hero" aria-labelledby="library-title">
      <div className="library-hero-copy">
        <h1 id="library-title">Your Library</h1>
        <p>
          Convert your books into interactive AI conversations.
          <br />
          Listen, learn, and discuss your favorite reads.
        </p>
        <Link href="/books/new" className="library-hero-button">
          <Plus aria-hidden="true" size={16} strokeWidth={2} />
          Add new book
        </Link>
      </div>

      <div className="library-hero-art" aria-hidden="true">
        <Image
          src="/assets/hero-illustration.png"
          alt=""
          width={490}
          height={340}
          priority
        />
      </div>

      <ol className="library-hero-steps">
        <li>
          <span>1</span>
          <div>
            <strong>Upload PDF</strong>
            <p>Add your book file</p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>AI Processing</strong>
            <p>We analyze the content</p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Voice Chat</strong>
            <p>Discuss with AI</p>
          </div>
        </li>
      </ol>
    </section>
  );
};

export default HeroSection;
