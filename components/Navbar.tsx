"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
  useUser,
} from "@clerk/nextjs";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add New", href: "/books/new" },
  { label: "Pricing", href: "/subscriptions" },
];

const Navbar = () => {
    const pathName = usePathname();
    const { user } = useUser();
    
  return (
    <header className="fixed z-50 w-full bg-transparent pt-3">
      <div className="wrapper">
        <div className="navbar-height flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-soft-sm">
          <Link href="/" className="flex gap-0.5 items-center">
            <Image
              src="/assets/logo.png"
              alt="Bookified"
              width={42}
              height={26}
            />
            <span className="logo-text">Bookified</span>
          </Link>
          <nav className="flex w-fit items-center gap-3 sm:gap-5 lg:gap-7.5">
          {navItems.map(({ label, href }) => {
            return (
              <Link
                href={href}
                key={label}
                className={`nav-link-base text-sm sm:text-base ${pathName === href ? "nav-link-active" : ""}`}
              >
                {label}
              </Link>
            );
          })}

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="nav-btn">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="nav-btn rounded-full bg-[var(--accent-warm)] px-2.5 py-2 text-sm text-white sm:px-4 sm:text-base"
              >
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="nav-user-link">
              <UserButton />
              {user?.firstName && (
                <Link href="/subscriptions" className="nav-user-name">
                  {user.firstName}
                </Link>
              )}
            </div>
            </Show>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
