import React from "react"

interface PricingRowProps {
  label: string
  value: number | string
  isTotal?: boolean
  children?: React.ReactNode
}

export const PricingRow: React.FC<PricingRowProps> = ({
  label,
  value,
  isTotal = false,
  children,
}) => {
  return (
    <div className="flex justify-between items-baseline mb-4">
      <span className={`ytf-form-label uppercase font-ytf-grand text-xs tracking-wide font-normal leading-none`} style={{ letterSpacing: '0.04em' }}>{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-body-secondary font-normal text-xs leading-none ${isTotal ? 'font-bold' : ''}`}>
          {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
        </span>
        {children}
      </div>
    </div>
  )
} 