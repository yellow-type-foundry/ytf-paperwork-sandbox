import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border-0 border-b border-b-[0.5px] border-outlinePrimary bg-transparent pl-0 pr-3 py-2 text-base ring-0 ring-offset-0 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-b-[0.5px] focus:border-black focus:bg-transparent disabled:cursor-not-allowed disabled:bg-[#B6B8AA] disabled:opacity-50 md:text-sm transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
