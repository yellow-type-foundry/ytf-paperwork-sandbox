import type React from "react"
import "@/app/globals.css"
import Header from "@/components/header"
import { ytfGrand, ytfOldman, ytfVangMono } from "./fonts"

export const metadata = {
  title: "Yellow Type Foundry - Document Generator",
  description: "Internal tool for generating EULAs, Quotations, and Invoices",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ytfGrand.variable} ${ytfOldman.variable} ${ytfVangMono.variable}`}
    >
      <body>
          <Header />
          <main>{children}</main>
      </body>
    </html>
  )
}
