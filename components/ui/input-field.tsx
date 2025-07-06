import React from "react"

interface InputFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  required?: boolean
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  autoComplete?: string
  error?: string
  touched?: boolean
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  onBlur,
  autoComplete,
  error,
  touched,
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
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input"
        style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '12px', lineHeight: '1.4', height: '18px', padding: 0 }}
      />
      {error && touched && (
        <div className="ytf-form-error mt-1">{error}</div>
      )}
    </div>
  );
}; 