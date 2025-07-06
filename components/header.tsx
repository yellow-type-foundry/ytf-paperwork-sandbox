"use client"

import Link from "next/link"

export default function Header() {
  return (
    <header>
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Left: YTF Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <img src="/YTF-LOGO.svg" alt="Yellow Type Foundry Logo" className="h-8 w-auto" />
          </Link>
        </div>
      </div>
    </header>
  )
}
