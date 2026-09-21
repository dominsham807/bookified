import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      className="wrapper mb-8 grid min-h-[190px] grid-cols-1 items-center gap-5 overflow-hidden rounded-[9px] bg-[#f3e4c7] px-5 py-7 pt-28  sm:grid-cols-[1fr_1.2fr_1fr] sm:gap-0 sm:px-8 sm:py-5 lg:px-7"
      aria-labelledby="library-title"
    >
      <div className="relative z-10 flex flex-col items-center text-center sm:items-start sm:text-left">
        <h1
          id="library-title"
          className="library-hero-title"
        >
          Your Library
        </h1>
        <p className="library-hero-description mt-2 text-[11px] sm:text-xs">
          Convert your books into interactive AI conversations.
          <br />
          Listen, learn, and discuss your favorite reads.
        </p>
        <Link
          href="/books/new"
          className="library-cta-primary mt-4 gap-1.5 px-5 py-2 text-xs"
        >
          <Plus aria-hidden="true" size={16} strokeWidth={2} />
          Add new book
        </Link>
      </div>

      <div className="flex h-full items-center justify-center" aria-hidden="true">
        <Image
          src="/assets/hero-illustration.png"
          alt=""
          width={490}
          height={340}
          priority
          className="h-auto w-full max-w-[230px] object-contain sm:max-w-[270px] lg:max-w-[290px]"
        />
      </div>

      <ol className="library-steps-card m-0 flex flex-col gap-3 px-3 py-3">
        <li className="library-step-item gap-2.5">
          <span className="library-step-number h-5 w-5 min-h-5 min-w-5 text-[10px]">
            1
          </span>
          <div>
            <strong className="library-step-title block text-[11px] leading-4">
              Upload PDF
            </strong>
            <p className="library-step-description mt-0.5 text-[10px] leading-3">
              Add your book file
            </p>
          </div>
        </li>
        <li className="library-step-item gap-2.5">
          <span className="library-step-number h-5 w-5 min-h-5 min-w-5 text-[10px]">
            2
          </span>
          <div>
            <strong className="library-step-title block text-[11px] leading-4">
              AI Processing
            </strong>
            <p className="library-step-description mt-0.5 text-[10px] leading-3">
              We analyze the content
            </p>
          </div>
        </li>
        <li className="library-step-item gap-2.5">
          <span className="library-step-number h-5 w-5 min-h-5 min-w-5 text-[10px]">
            3
          </span>
          <div>
            <strong className="library-step-title block text-[11px] leading-4">
              Voice Chat
            </strong>
            <p className="library-step-description mt-0.5 text-[10px] leading-3">
              Discuss with AI
            </p>
          </div>
        </li>
      </ol>
    </section>
  );
};

export default HeroSection;
