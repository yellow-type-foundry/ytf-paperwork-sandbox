"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface CurrencyConverterProps {
  amount: number
  from: string
  to: string
}

export function CurrencyConverter({ amount, from, to }: CurrencyConverterProps) {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  useEffect(() => {
    let rate = 1;
    if (from === 'USD' && to === 'VND') {
      rate = 24500; // Fixed rate
    }
    setExchangeRate(rate);
    setConvertedAmount(amount * rate);
  }, [amount, from, to]);

  if (convertedAmount === null) {
    return null;
  }

  return (
    <div className="text-sm">
      <span className="text-muted-foreground">
        ≈ {convertedAmount.toLocaleString()} {to}
      </span>
      {exchangeRate && (
        <span className="text-xs text-muted-foreground ml-2">
          (1 {from} = {exchangeRate.toLocaleString()} {to})
        </span>
      )}
    </div>
  );
}
