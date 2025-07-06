import localFont from "next/font/local"

// Load YTF custom fonts
export const ytfGrand = localFont({
  src: [
    {
      path: "../public/fonts/YTFGrand123-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-ytf-grand",
  display: "swap",
})

export const ytfOldman = localFont({
  src: [
    {
      path: "../public/fonts/YTFOldman-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ytf-oldman",
  display: "swap",
})

export const ytfVangMono = localFont({
  src: [
    {
      path: "../public/fonts/YTFVangMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-ytf-vangmono",
  display: "swap",
})
