"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname();
  return (
    <header>
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Left: YTF Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <img src="/YTF-LOGO.svg" alt="Yellow Type Foundry Logo" className="h-8 w-auto" />
          </Link>
        </div>
        {/* Right: Nav Links */}
        <nav className="flex gap-6 items-center">
          <Link
            href="/quotation"
            className={`heading-mono transition-opacity duration-200 ease-in-out ${pathname === "/quotation" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
          >
            Quotation
          </Link>
          <Link
            href="/eula-editor"
            className={`heading-mono transition-opacity duration-200 ease-in-out ${pathname === "/eula-editor" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
          >
            EULA Editor
          </Link>
        </nav>
      </div>
    </header>
  )
}
