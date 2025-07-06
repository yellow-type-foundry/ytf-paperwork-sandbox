import React from "react"
import { useRef, useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface SelectFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  required?: boolean
  autoComplete?: string
  error?: string
  touched?: boolean
  children: React.ReactNode
  disabled?: boolean
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  autoComplete,
  error,
  touched,
  children,
  disabled,
}) => {
  // Split label and asterisk if present
  const isRequired = label.trim().endsWith("*");
  const labelText = isRequired ? label.trim().slice(0, -1).trim() : label;
  return (
    <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
      <label htmlFor={name} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
        {labelText}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input"
        disabled={disabled}
        style={disabled ? { opacity: 0.2 } : {}}
      >
        {children}
      </select>
      {error && touched && (
        <div className="ytf-form-error mt-1">{error}</div>
      )}
    </div>
  );
};

// MultiSelectDropdown: generic, controlled, visually consistent multi-select dropdown
export function MultiSelectDropdown({
  options,
  value,
  onChange,
  label,
  name,
  required,
  placeholder,
}: {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (selected: string[]) => void
  label?: string
  name?: string
  required?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (optionValue: string) => {
    let newSelected: string[];
    if (value.includes(optionValue)) {
      newSelected = value.filter((v) => v !== optionValue);
    } else {
      newSelected = [...value, optionValue];
    }
    onChange(newSelected);
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  return (
    <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
      {label && (
        <label htmlFor={name} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
          {label.replace(/\*+$/, '').trim()} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={name}
            className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input flex items-center justify-between"
            style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '12px', lineHeight: '1.4', height: '18px', padding: 0 }}
            aria-required={required}
          >
            <span className="flex-1 truncate text-left" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedLabels.length > 0 ? (
                <span>{selectedLabels.join(", ")}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder || 'Select...'} </span>
              )}
            </span>
            <svg
              className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 ease-in-out ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path d="M6 8l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-full min-w-[180px]">
          <div>
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`flex items-center w-full px-3 py-2 text-left text-[12px] font-ytf-grand ${value.includes(option.value) ? 'bg-black text-white' : 'bg-white text-black'} hover:bg-black hover:text-white transition-colors`}
                onClick={() => handleToggle(option.value)}
                tabIndex={0}
                aria-pressed={value.includes(option.value)}
              >
                <span className="flex-1">{option.label}</span>
                <span className="ml-2">
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    readOnly
                    className="accent-black w-3 h-3 align-middle pointer-events-none"
                    tabIndex={-1}
                  />
                </span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 