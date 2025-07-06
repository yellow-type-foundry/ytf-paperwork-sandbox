import React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { ytfTypefaces, getAvailableLicenseTypes, getUsageOptionsForLicenseType, getBusinessSizeUsage } from "@/utils/typeface-data"
import { SectionTitle } from "@/components/ui/section-title"

interface TypefaceItemProps {
  index: number
  item: {
    typefaceFamily: string
    typefaceVariant: string
    basePrice: number
    licenseType: string
    usage: string
  }
  availableVariants: string[]
  ytfTypefaces: typeof ytfTypefaces
  businessSize: string
  errors: {
    typefaceFamily?: string
    typefaceVariant?: string
    licenseType?: string
    usage?: string
  }
  touched: {
    typefaceFamily?: boolean
    typefaceVariant?: boolean
    licenseType?: boolean
    usage?: boolean
  }
  onRemove: () => void
  onSelectChange: (field: string, value: string | string[]) => void
  onBlur: (field: string, value: string) => void
  canRemove: boolean
}

export const TypefaceItem: React.FC<TypefaceItemProps> = ({
  index,
  item,
  availableVariants,
  ytfTypefaces,
  businessSize,
  errors,
  touched,
  onRemove,
  onSelectChange,
  onBlur,
  canRemove,
}) => {
  // Get available license types based on business size
  const availableLicenseTypes = getAvailableLicenseTypes(businessSize)
  
  // Check if current license type is still valid for the current business size
  const isCurrentLicenseTypeValid = availableLicenseTypes.some(lt => lt.id === item.licenseType)
  
  // If current license type is not valid, we need to handle this in the parent component
  // For now, we'll show all available options and let the parent handle validation
  const displayLicenseTypes = availableLicenseTypes
  
  // Get usage options for the selected license type
  const usageOptions = getUsageOptionsForLicenseType(item.licenseType)
  
  // Check if usage should be auto-filled from business size
  const isUsageAutoFilled = ['desktop', 'web', 'logo'].includes(item.licenseType)
  
  // Handle license type change
  const handleLicenseTypeChange = (value: string) => {
    // Simply update the license type - let the parent handle usage updates
    onSelectChange("licenseType", value)
  }

  return (
    <div className="mb-1 py-1 px-3 bg-[#F4F6E9]">
      <div className="flex justify-between items-center mb-0">
        <SectionTitle className="mb-2">
          #{index + 1} {item.typefaceFamily} {item.typefaceVariant}
        </SectionTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          className="p-0 hover:bg-transparent active:bg-transparent -mr-2"
        >
          <Trash2 className="h-4 w-4 text-black" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
          <label htmlFor={`item-${index}-family`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            TYPEFACE <span className="text-destructive">*</span>
          </label>
          <Select
            value={item.typefaceFamily}
            onValueChange={(val) => onSelectChange("typefaceFamily", val)}
            name={`item-${index}-family`}
          >
            <SelectTrigger id={`item-${index}-family`} className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '12px', lineHeight: '1.4', height: '18px', padding: 0 }}>
              <SelectValue placeholder="Select typeface family" />
            </SelectTrigger>
            <SelectContent>
              {ytfTypefaces.map((typeface) => (
                <SelectItem key={typeface.family} value={typeface.family}>
                  {typeface.family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
          <label htmlFor={`item-${index}-variant`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            STYLE <span className="text-destructive">*</span>
          </label>
          <Select
            value={item.typefaceVariant}
            onValueChange={(val) => onSelectChange("typefaceVariant", val)}
            name={`item-${index}-variant`}
          >
            <SelectTrigger id={`item-${index}-variant`} className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '12px', lineHeight: '1.4', height: '18px', padding: 0 }}>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {availableVariants.map((variant) => (
                <SelectItem key={variant} value={variant}>
                  {variant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
          <label htmlFor={`item-${index}-licenseType`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            LICENSE TYPE <span className="text-destructive">*</span>
          </label>
          <Select
            value={isCurrentLicenseTypeValid ? item.licenseType : ""}
            onValueChange={handleLicenseTypeChange}
            name={`item-${index}-licenseType`}
          >
            <SelectTrigger id={`item-${index}-licenseType`} className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '12px', lineHeight: '1.4', height: '18px', padding: 0 }}>
              <SelectValue placeholder={isCurrentLicenseTypeValid ? undefined : "Select license type"} />
            </SelectTrigger>
            <SelectContent>
              {displayLicenseTypes.map((licenseType) => (
                <SelectItem key={licenseType.id} value={licenseType.id}>
                  {licenseType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
          <label htmlFor={`item-${index}-usage`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            USAGE <span className="text-destructive">*</span>
          </label>
          <Select
            value={item.usage}
            onValueChange={(val) => onSelectChange("usage", val)}
            name={`item-${index}-usage`}
            disabled={isUsageAutoFilled}
          >
            <SelectTrigger id={`item-${index}-usage`} className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '12px', lineHeight: '1.4', height: '18px', padding: 0 }}>
              <SelectValue placeholder="Select usage" />
            </SelectTrigger>
            <SelectContent>
              {usageOptions.map((usage) => (
                <SelectItem key={usage.id} value={usage.id}>
                  {usage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
} 