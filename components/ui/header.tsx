import Link from "next/link"
import { Button } from "./button"

export function Header() {
  return (
    <header className="w-full border-b border-black">
      <div className="container mx-auto max-w-[70%] px-8 lg:px-16">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-oldman text-2xl">YTF</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/quotation">
              <Button variant="ghost" className="font-oldman">
                Quotation
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="font-oldman">
                About
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 