import React from "react"

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
}

export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2 className={`font-oldman text-[32px] tracking-[0em] uppercase leading-[1] md:leading-normal ${className || ""}`}>
      <span className="block md:inline">
        {typeof children === 'string' ? (
          children.split(',').map((part, index, array) => (
            <React.Fragment key={index}>
              {part.trim()}
              {index < array.length - 1 && (
                <span className="block md:inline md:mx-2">
                  {index === array.length - 2 ? ' ' : ''}
                </span>
              )}
            </React.Fragment>
          ))
        ) : children}
      </span>
    </h2>
  )
} 