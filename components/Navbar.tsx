"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  Show,
    UserButton,
  useClerk,
  useUser
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
    <header className="w-full fixed z-50 bg-('--bg-primary')">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href="/" className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified"
            width={42}
            height={26}
          />
          <span className="logo-text">Bookified</span>
        </Link>
        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            return (
              <Link href={href} key={label}>
                {label}
              </Link>
            );
          })}

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button type="button" className="text-sm font-medium">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full bg-[var(--accent-warm)] px-4 py-2 text-sm font-medium text-white"
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
    </header>
  );
};

export default Navbar;
