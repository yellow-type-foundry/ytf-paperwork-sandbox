import React, { useMemo } from "react"
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
  ytfTypefaces,
  businessSize,
  errors,
  touched,
  onRemove,
  onSelectChange,
  onBlur,
  canRemove,
}) => {
  // Memoize available license types to prevent unnecessary re-renders
  const availableLicenseTypes = useMemo(() => 
    getAvailableLicenseTypes(businessSize), 
    [businessSize]
  )
  
  // Check if current license type is still valid for the current business size
  const isCurrentLicenseTypeValid = useMemo(() => 
    availableLicenseTypes.some(lt => lt.id === item.licenseType),
    [availableLicenseTypes, item.licenseType]
  )
  
  // Get usage options for the selected license type
  const usageOptions = useMemo(() => 
    getUsageOptionsForLicenseType(item.licenseType),
    [item.licenseType]
  )
  
  // Check if usage should be auto-filled from business size
  const isUsageAutoFilled = useMemo(() => 
    ['desktop', 'web', 'logo'].includes(item.licenseType),
    [item.licenseType]
  )

  // Memoize available variants for the selected typeface family
  const availableVariants = useMemo(() => {
    const selectedTypeface = ytfTypefaces.find(tf => tf.family === item.typefaceFamily)
    return selectedTypeface?.variants || []
  }, [ytfTypefaces, item.typefaceFamily])

  // Handle license type change
  const handleLicenseTypeChange = (value: string) => {
    onSelectChange("licenseType", value)
  }

  // Handle typeface family change with proper validation
  const handleTypefaceFamilyChange = (value: string) => {
    const selectedTypeface = ytfTypefaces.find(tf => tf.family === value)
    if (selectedTypeface) {
      // First update the typeface family
      onSelectChange("typefaceFamily", value)
      // Then update the variant to the first available variant
      onSelectChange("typefaceVariant", selectedTypeface.variants[0])
    }
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
        <div className="flex items-center border-b-[0.5px] border-black h-9 pb-[12px] w-full gap-[12px]">
          <label htmlFor={`item-${index}-family`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            TYPEFACE <span className="text-destructive">*</span>
          </label>
          <Select
            value={item.typefaceFamily || ""}
            onValueChange={handleTypefaceFamilyChange}
            name={`item-${index}-family`}
          >
            <SelectTrigger id={`item-${index}-family`} className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontSize: '14px' }}>
              <SelectValue placeholder="Select typeface family" style={{ fontSize: '14px' }} />
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
        <div className="flex items-center border-b-[0.5px] border-black h-9 pb-[12px] w-full gap-[12px]">
          <label htmlFor={`item-${index}-variant`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            STYLE <span className="text-destructive">*</span>
          </label>
          <Select
            value={item.typefaceVariant || ""}
            onValueChange={(val) => onSelectChange("typefaceVariant", val)}
            name={`item-${index}-variant`}
            disabled={!item.typefaceFamily}
          >
            <SelectTrigger 
              id={`item-${index}-variant`} 
              className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" 
              style={{ fontSize: '14px' }}
              disabled={!item.typefaceFamily}
            >
              <SelectValue placeholder={item.typefaceFamily ? "Select style" : "Select typeface first"} style={{ fontSize: '14px' }} />
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
        <div className="flex items-center border-b-[0.5px] border-black h-9 pb-[12px] w-full gap-[12px]">
          <label htmlFor={`item-${index}-licenseType`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            LICENSE TYPE <span className="text-destructive">*</span>
          </label>
          <Select
            value={isCurrentLicenseTypeValid ? item.licenseType : ""}
            onValueChange={handleLicenseTypeChange}
            name={`item-${index}-licenseType`}
          >
            <SelectTrigger
              id={`item-${index}-licenseType`}
              className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input"
              disabled={!isCurrentLicenseTypeValid}
              style={{ ...(isCurrentLicenseTypeValid ? { fontSize: '14px' } : { opacity: 0.2, fontSize: '14px' }) }}
            >
              <SelectValue placeholder={isCurrentLicenseTypeValid ? undefined : "Select license type"} style={{ fontSize: '14px' }} />
            </SelectTrigger>
            <SelectContent>
              {availableLicenseTypes.map((licenseType) => (
                <SelectItem key={licenseType.id} value={licenseType.id}>
                  {licenseType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center border-b-[0.5px] border-black h-9 pb-[12px] w-full gap-[12px]">
          <label htmlFor={`item-${index}-usage`} className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
            USAGE <span className="text-destructive">*</span>
          </label>
          <Select
            value={item.usage || ""}
            onValueChange={(val) => onSelectChange("usage", val)}
            name={`item-${index}-usage`}
            disabled={isUsageAutoFilled}
          >
            <SelectTrigger
              id={`item-${index}-usage`}
              className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input"
              disabled={isUsageAutoFilled}
              style={{ ...(isUsageAutoFilled ? { opacity: 0.2, fontSize: '14px' } : { fontSize: '14px' }) }}
            >
              <SelectValue placeholder="Select usage" style={{ fontSize: '14px' }} />
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