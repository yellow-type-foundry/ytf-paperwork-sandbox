"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Loader2, AlertCircle, Download, Info } from "lucide-react"
import { generateQuotationPDF } from "@/utils/pdf-generator"
import dynamic from "next/dynamic"
import { CurrencyConverter } from "@/components/currency-converter"
import {
  ytfTypefaces,
  businessSizes,
  getLanguageCutForVariant,
  getTypefaceByFamily,
  calculateItemPrice,
  getBusinessSizeUsage,
  getAvailableLicenseTypes,
  getUsageOptionsForLicenseType,
  calculateDiscount,
} from "@/utils/typeface-data"
import { parseWithAI } from "@/utils/ai-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InputField } from "@/components/ui/input-field"
import { SelectField } from "@/components/ui/select-field"
import { MultiSelectDropdown } from "@/components/ui/select-field"
import { SectionHeader } from "@/components/ui/section-header"
import { PricingRow } from "@/components/ui/pricing-row"
import { TypefaceItem } from "@/components/ui/typeface-item"

const PDFPreview = dynamic(() => import("@/components/pdf-preview"), { ssr: false })

// Add type definitions
interface FormItem {
  typefaceFamily: string
  typefaceVariant: string
  typeface: string
  languageCut: string
  basePrice: number
  amount: number
  licenseType: string
  usage: string
}

interface FormData {
  clientName: string
  clientEmail: string
  clientAddress: string
  quotationNumber: string
  quotationDate: string
  businessSize: string
  items: FormItem[]
  subtotal: number
  discount: number
  total: number
  billingAddress: {
    companyName: string
    street: string
    suburb: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

// Update TouchedFields interface to use a type for item fields
type ItemTouchedFields = {
  [K in keyof FormItem]: boolean
}

type ItemErrors = {
  [K in keyof FormItem]: string
}

interface TouchedFields {
  clientName: boolean
  clientEmail: boolean
  businessSize: boolean
  items: ItemTouchedFields[]
}

interface Errors {
  clientName: string
  clientEmail: string
  businessSize: string
  items: ItemErrors[]
}

// Generate the quotation number in DDMMYYYYXXX format, with daily incrementing counter in localStorage
function generateQuotationNumber() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const datePart = `${day}${month}${year}`;
  if (typeof window !== 'undefined') {
    const storageKey = 'ytf-quotation-counter';
    let counter = 1;
    let lastDate = '';
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        lastDate = parsed.date;
        counter = parsed.counter;
      }
    } catch {}
    if (lastDate === datePart) {
      counter += 1;
    } else {
      counter = 1;
    }
    window.localStorage.setItem(storageKey, JSON.stringify({ date: datePart, counter }));
    return `${datePart}${String(counter).padStart(3, '0')}`;
  } else {
    return `${datePart}001`;
  }
}

export default function QuotationPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showBottomBar, setShowBottomBar] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  // Quotation number state for client-only generation
  const [quotationNumber, setQuotationNumber] = useState("");

  // Set the quotation number on client mount
  useEffect(() => {
    setQuotationNumber(generateQuotationNumber());
  }, []);

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    quotationNumber: quotationNumber,
    quotationDate: new Date().toISOString().split("T")[0],
    businessSize: "individual", // Default to individual
    items: [
      {
        typefaceFamily: "YTF Gióng", // Set default typeface family
        typefaceVariant: "Roman", // Set default variant
        typeface: "YTF Gióng Roman", // Set default full typeface name
        languageCut: "Latin, Roman", // Set to match style
        basePrice: 100.0, // Set base price for YTF Gióng
        amount: 100.0, // Set initial amount
        licenseType: "desktop", // Default to Desktop
        usage: "Non-commercial use", // Default for individual license
      },
    ],
    subtotal: 0,
    discount: 0,
    total: 0,
    billingAddress: {
      companyName: "",
      street: "",
      suburb: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  })

  // Keep formData.quotationNumber in sync with quotationNumber state
  useEffect(() => {
    setFormData((prev) => ({ ...prev, quotationNumber }));
  }, [quotationNumber]);

  // Track touched fields for validation
  const defaultTouchedItem = {
    typefaceFamily: false,
    typefaceVariant: false,
    typeface: false,
    languageCut: false,
    basePrice: false,
    amount: false,
    licenseType: false,
    usage: false,
  }
  const defaultErrorItem = {
    typefaceFamily: "",
    typefaceVariant: "",
    typeface: "",
    languageCut: "",
    basePrice: "",
    amount: "",
    licenseType: "",
    usage: "",
  }
  const [touchedFields, setTouchedFields] = useState({
    clientName: false,
    clientEmail: false,
    businessSize: false,
    items: [ { ...defaultTouchedItem } ],
  })
  const [errors, setErrors] = useState({
    clientName: "",
    clientEmail: "",
    businessSize: "",
    items: [ { ...defaultErrorItem } ],
  })

  // Track available variants for each item
  const [availableVariants, setAvailableVariants] = useState([["Roman", "Italic"]]) // Set default variants for YTF Gióng

  // Enable client-side rendering detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update the useEffect for initial calculation
  useEffect(() => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) => {
        // Ensure license type is valid for current business size
        const availableLicenseTypes = getAvailableLicenseTypes(prev.businessSize)
        const isLicenseTypeValid = availableLicenseTypes.some(lt => lt.id === item.licenseType)
        
        let finalLicenseType = item.licenseType
        let finalUsage = item.usage
        
        if (!isLicenseTypeValid) {
          // Set to first available option
          finalLicenseType = availableLicenseTypes[0]?.id || 'desktop'
          // Set appropriate usage
          if (['desktop', 'web', 'logo'].includes(finalLicenseType)) {
            finalUsage = getBusinessSizeUsage(prev.businessSize)
          } else {
            finalUsage = ""
          }
        }
        
        // Calculate amount using the new pricing logic
        const amount = calculateItemPrice(
          item.typefaceFamily,
          prev.businessSize,
          finalLicenseType,
          finalUsage
        );
        
        return { 
          ...item, 
          licenseType: finalLicenseType,
          usage: finalUsage,
          amount 
        };
      });
      const subtotal = updatedItems.reduce((sum, item) => sum + (Number.parseFloat(String(item.amount)) || 0), 0);
      
      // Calculate discount
      const { amount: discountAmount } = calculateDiscount(updatedItems, prev.businessSize);
      const total = subtotal - discountAmount;
      
      return { ...prev, items: updatedItems, subtotal, discount: discountAmount, total };
    });
  }, []);

  // Keep availableVariants in sync with formData.items
  useEffect(() => {
    if (formData.items && formData.items.length > 0) {
      const newAvailableVariants = formData.items.map(item => {
        const typeface = ytfTypefaces.find(tf => tf.family === item.typefaceFamily);
        return typeface ? typeface.variants : ["Roman", "Italic"];
      });
      
      // Only update if the arrays are different
      if (JSON.stringify(newAvailableVariants) !== JSON.stringify(availableVariants)) {
        setAvailableVariants(newAvailableVariants);
      }
    }
  }, [formData.items, ytfTypefaces]);

  // Update the useEffect for business size change
  useEffect(() => {
    const selectedBusinessSize = businessSizes.find((size) => size.id === formData.businessSize)
    if (!selectedBusinessSize) return

    // Update all items with recalculated prices based on business size
    const updatedItems = formData.items.map((item) => {
      // Check if current licenseType is still valid for new business size
      const availableLicenseTypes = getAvailableLicenseTypes(formData.businessSize)
      const isLicenseTypeValid = availableLicenseTypes.some(lt => lt.id === item.licenseType)
      
      // Determine new license type
      let newLicenseType = item.licenseType
      if (!isLicenseTypeValid) {
        // If current license type is not valid, set to first available option
        newLicenseType = availableLicenseTypes[0]?.id || 'desktop'
      }
      
      // Update usage based on new license type
      let newUsage = item.usage
      if (['desktop', 'web', 'logo'].includes(newLicenseType)) {
        newUsage = getBusinessSizeUsage(formData.businessSize)
      } else if (!isLicenseTypeValid) {
        // If license type changed, clear usage for manual selection
        newUsage = ""
      }
      
      // Calculate new amount using the new pricing logic
      const amount = calculateItemPrice(
        item.typefaceFamily,
        formData.businessSize,
        newLicenseType,
        newUsage
      )
      
      return {
        ...item,
        licenseType: newLicenseType,
        usage: newUsage,
        amount,
      }
    })

    // Calculate new totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (Number.parseFloat(String(item.amount)) || 0), 0)
    
    // Calculate discount
    const { amount: discountAmount } = calculateDiscount(updatedItems, formData.businessSize);
    const total = subtotal - discountAmount

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      discount: discountAmount,
      total,
    }))
  }, [formData.businessSize])

  // Update validateField with proper types
  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "clientName":
        return value.trim() === "" ? "Client name is required" : ""
      case "clientEmail":
        if (value.trim() === "") return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(value) ? "Please enter a valid email address" : ""
      case "businessSize":
        return value.trim() === "" ? "Business size is required" : ""
      default:
        return ""
    }
  }

  // Update validateItemField with proper types
  const validateItemField = (index: number, field: keyof FormItem, value: string | string[]): string => {
    if (field === "typefaceFamily" && typeof value === "string" && value.trim() === "") {
      return "Typeface family is required"
    }
    if (field === "typefaceVariant" && typeof value === "string" && value.trim() === "") {
      return "Typeface variant is required"
    }
    return ""
  }

  // Update handleInputChange with proper types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith("billingAddress.")) {
      const field = name.replace("billingAddress.", "")
      setFormData((prev) => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value,
        },
      }))
    } else {
    setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // If the field has been touched, validate it (for global fields only)
    if (name === "clientName" || name === "clientEmail" || name === "businessSize") {
      if (touchedFields[name as keyof TouchedFields]) {
      setErrors((prev) => ({
        ...prev,
          [name]: validateField(name as keyof FormData, value),
      }))
      }
    }
  }

  // Update handleItemChange to remove discount parameters
  const handleItemChange = (index: number, field: keyof FormItem, value: string | number | string[]) => {
    const newItems = [...formData.items]
    const newAvailableVariants = [...availableVariants]
    const newTouchedItems = [...touchedFields.items]
    const newItemErrors = [...errors.items]

    if (field === "typefaceFamily") {
      const selectedTypeface = getTypefaceByFamily(value as string)
      if (selectedTypeface) {
        newAvailableVariants[index] = selectedTypeface.variants
        if (selectedTypeface.variants.length > 0) {
          // Calculate amount using the pricing logic while preserving licenseType and usage
          const amount = calculateItemPrice(
            value as string,
            formData.businessSize,
            newItems[index].licenseType,
            newItems[index].usage
          )
          
          newItems[index] = {
            ...newItems[index],
            typefaceVariant: selectedTypeface.variants[0],
            languageCut: `Latin, ${selectedTypeface.variants[0]}`,
            basePrice: selectedTypeface.basePrice,
            typeface: `${value} ${selectedTypeface.variants[0]}`,
            amount,
          }
        }
      }
    }

    if (field === "typefaceVariant") {
      newItems[index] = {
        ...newItems[index],
        languageCut: `Latin, ${value}`,
        typeface: `${newItems[index].typefaceFamily} ${value}`,
      }
    }

    // Handle licenseType changes
    if (field === "licenseType") {
      const newLicenseType = value as string
      
      // Update the license type
      newItems[index] = {
        ...newItems[index],
        licenseType: newLicenseType,
      }
      
      // If this is a business-size-based license, auto-update usage
      if (['desktop', 'web', 'logo'].includes(newLicenseType)) {
        const newUsage = getBusinessSizeUsage(formData.businessSize)
        newItems[index] = {
          ...newItems[index],
          usage: newUsage,
        }
      } else {
        // For manual selection licenses, clear usage
        newItems[index] = {
          ...newItems[index],
          usage: "",
        }
      }
      
      // Recalculate amount based on new licenseType and usage
      const amount = calculateItemPrice(
        newItems[index].typefaceFamily,
        formData.businessSize,
        newItems[index].licenseType,
        newItems[index].usage
      )
      
      newItems[index].amount = amount
    }
    
    // Handle usage changes
    if (field === "usage") {
      newItems[index] = {
        ...newItems[index],
        usage: value as string,
      }
      
      // Recalculate amount based on new usage
      const amount = calculateItemPrice(
        newItems[index].typefaceFamily,
        formData.businessSize,
        newItems[index].licenseType,
        newItems[index].usage
      )
      
      newItems[index].amount = amount
    }

    // Handle amount change directly
    if (field === "amount") {
      newItems[index] = {
        ...newItems[index],
        amount: Number(value) || 0,
      }
    } else if (field !== "licenseType" && field !== "usage" && field !== "typefaceFamily" && field !== "typefaceVariant") {
      // Update other field values (excluding fields handled above)
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }
    }

    // If basePrice changed, update amount
    if (field === "basePrice") {
      newItems[index].amount = Number(value) || 0;
    }

    // Calculate subtotal and total
    const subtotal = newItems.reduce((sum, item) => sum + (Number.parseFloat(String(item.amount)) || 0), 0)
    
    // Calculate discount
    const { amount: discountAmount } = calculateDiscount(newItems, formData.businessSize);
    const total = subtotal - discountAmount

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      discount: discountAmount,
      total,
    }))

    setAvailableVariants(newAvailableVariants)

    // Validate the item field if it's been touched
    if (
      touchedFields.items[index] &&
      (field === "typefaceFamily" || field === "typefaceVariant")
    ) {
      newItemErrors[index] = {
        ...newItemErrors[index],
        [field]: validateItemField(index, field, value as string | string[]),
      }

      setErrors((prev) => ({
        ...prev,
        items: newItemErrors,
      }))
    }
  }

  // Update handleSelectChange with proper types
  const handleSelectChange = (index: number, field: keyof FormItem, value: string | string[]) => {
    handleItemChange(index, field, value)
  }

  // Update handleItemBlur to use proper type assertions
  const handleItemBlur = (index: number, field: keyof FormItem, value: string | string[] | number) => {
    const newTouchedItems = [...touchedFields.items]
    if (!newTouchedItems[index]) {
      newTouchedItems[index] = {
        typefaceFamily: false,
        typefaceVariant: false,
        typeface: false,
        languageCut: false,
        basePrice: false,
        amount: false,
      } as ItemTouchedFields
    }
    newTouchedItems[index][field] = true

    setTouchedFields((prev) => ({
      ...prev,
      items: newTouchedItems,
    }))

    const newItemErrors = [...errors.items]
    if (!newItemErrors[index]) {
      newItemErrors[index] = {
        typefaceFamily: "",
        typefaceVariant: "",
        typeface: "",
        languageCut: "",
        basePrice: "",
        amount: "",
      } as ItemErrors
    }
    newItemErrors[index][field] = validateItemField(index, field, value as string | string[])

    setErrors((prev) => ({
      ...prev,
      items: newItemErrors,
    }))
  }

  const addItem = () => {
    const defaultTypeface = getTypefaceByFamily("YTF Gióng")
    const defaultVariant = defaultTypeface?.variants[0] || "Roman"
    const basePrice = defaultTypeface?.basePrice || 100.0

    // Get default license type and usage based on business size
    const availableLicenseTypes = getAvailableLicenseTypes(formData.businessSize)
    const defaultLicenseType = availableLicenseTypes[0]?.id || "desktop"
    const defaultUsage = getBusinessSizeUsage(formData.businessSize)

    const newItems = [
      ...formData.items,
      {
        typefaceFamily: "YTF Gióng",
        typefaceVariant: defaultVariant,
        typeface: `YTF Gióng ${defaultVariant}`,
        languageCut: `Latin, ${defaultVariant}`,
        basePrice,
        amount: basePrice,
        licenseType: defaultLicenseType,
        usage: defaultUsage,
      },
    ];

    // Calculate new subtotal and total
    const subtotal = newItems.reduce((sum, item) => sum + (Number.parseFloat(String(item.amount)) || 0), 0);
    
    // Calculate discount
    const { amount: discountAmount } = calculateDiscount(newItems, formData.businessSize);
    const total = subtotal - discountAmount;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      discount: discountAmount,
      total,
    }));
    setAvailableVariants((prev) => [...prev, defaultTypeface?.variants || ["Roman", "Italic"]]);
    setTouchedFields((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultTouchedItem }],
    }));
    setErrors((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultErrorItem }],
    }));
  }

  // Update removeItem with proper types
  const removeItem = (index: number) => {
    if (formData.items.length === 1) return

    const newItems = formData.items.filter((_, i) => i !== index)
    const newAvailableVariants = availableVariants.filter((_, i) => i !== index)
    const newTouchedItems = touchedFields.items.filter((_, i) => i !== index)
    const newItemErrors = errors.items.filter((_, i) => i !== index)

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + (Number.parseFloat(String(item.amount)) || 0), 0)
    
    // Calculate discount
    const { amount: discountAmount } = calculateDiscount(newItems, formData.businessSize);
    const total = subtotal - discountAmount

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      discount: discountAmount,
      total,
    }))

    setAvailableVariants(newAvailableVariants)

    setTouchedFields((prev) => ({
      ...prev,
      items: newTouchedItems,
    }))

    setErrors((prev) => ({
      ...prev,
      items: newItemErrors,
    }))
  }

  // Validate all fields before submission
  const validateForm = () => {
    const newErrors = {
      clientName: validateField("clientName", formData.clientName),
      clientEmail: validateField("clientEmail", formData.clientEmail),
      businessSize: validateField("businessSize", formData.businessSize),
      items: formData.items.map((item, index) => ({
        typefaceFamily: validateItemField(index, "typefaceFamily", item.typefaceFamily),
        typefaceVariant: validateItemField(index, "typefaceVariant", item.typefaceVariant),
        typeface: "",
        languageCut: "",
        basePrice: "",
        amount: "",
        licenseType: "",
        usage: "",
      })),
    }
    setErrors(newErrors)
    setTouchedFields({
      clientName: true,
      clientEmail: true,
      businessSize: true,
      items: formData.items.map(() => ({ ...defaultTouchedItem })),
    })
    return (
      !newErrors.clientName &&
      !newErrors.clientEmail &&
      !newErrors.businessSize &&
      !newErrors.items.some((item) => item.typefaceFamily || item.typefaceVariant)
    )
  }

  const isFormValid = () => {
    return (
      formData.clientName &&
      formData.clientEmail &&
      formData.businessSize &&
      formData.items.some((item) => item.typefaceFamily && item.typefaceVariant)
    )
  }

  // Generate PDF using jsPDF with custom fonts and layout
  const generatePDF = async () => {
    if (!isFormValid() || !validateForm()) {
      return
    }

    setIsGenerating(true)
    let blobUrl: string | null = null
    let link: HTMLAnchorElement | null = null

    try {
      console.log("Starting PDF generation...")
      
      // Generate PDF blob with retry logic
      let blob: Blob | null = null
      let retryCount = 0
      const maxRetries = 3

      while (!blob && retryCount < maxRetries) {
        try {
          blob = await generateQuotationPDF(formData)
          console.log("PDF generated successfully")
        } catch (error) {
          console.error(`PDF generation attempt ${retryCount + 1} failed:`, error)
          retryCount++
          if (retryCount === maxRetries) {
            throw error
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!blob) {
        throw new Error("Failed to generate PDF blob after multiple attempts")
      }

      // Create URL for blob
      blobUrl = URL.createObjectURL(blob)
      console.log("Blob URL created successfully")

      // Create temporary link element
      link = document.createElement("a")
      link.href = blobUrl
      link.download = `YTF-Quotation-${formData.quotationNumber}.pdf`
      console.log("Download link created successfully")

      // Append link to document and trigger download
      document.body.appendChild(link)
      link.click()
      console.log("Download triggered successfully")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsGenerating(false)
      // Clean up
      if (link && link.parentNode) {
        link.parentNode.removeChild(link)
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
      console.log("Cleanup completed successfully")
    }
  }

  // Get the selected business size object
  const selectedBusinessSize = businessSizes.find((size) => size.id === formData.businessSize)

  // Add this handler above the return statement
  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        country: value,
      },
    }));
  };

  // Add handleBlur function
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target
    if (name === "clientName" || name === "clientEmail" || name === "businessSize") {
      setTouchedFields((prev) => ({
        ...prev,
        [name]: true,
      }))
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof FormData, e.target.value),
      }))
    }
  }

  // Add handleBusinessSizeChange function
  const handleBusinessSizeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessSize: value,
    }))
    setTouchedFields((prev) => ({
      ...prev,
      businessSize: true,
    }))
    setErrors((prev) => ({
      ...prev,
      businessSize: validateField("businessSize", value),
    }))
  }

  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiInput, setAiInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiBundleSuggestions, setAiBundleSuggestions] = useState<Array<{
    type: 'style' | 'license' | 'typeface';
    description: string;
    potentialSavings: number;
    items: FormItem[];
  }>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return
    const handleScroll = () => {
      // Always show the bottom bar on mobile and desktop
      setShowBottomBar(true)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Generate intelligent bundle suggestions
  const generateBundleSuggestions = (currentItems: FormItem[], businessSize: string) => {
    const suggestions: Array<{
      type: 'style' | 'license' | 'typeface';
      description: string;
      potentialSavings: number;
      items: FormItem[];
    }> = [];
    
    // Defensive checks
    if (!currentItems || currentItems.length === 0 || businessSize === 'individual') {
      return suggestions;
    }
    
    // Get current discount info
    const currentDiscount = calculateDiscount(currentItems, businessSize);
    const currentTotal = currentItems.reduce((sum, item) => sum + item.amount, 0);
    const currentFinalTotal = currentTotal - currentDiscount.amount;
    
    // Style bundle suggestions
    if (currentItems && Array.isArray(currentItems)) {
      currentItems.forEach(item => {
        const typeface = ytfTypefaces.find(tf => tf.family === item.typefaceFamily);
        if (typeface && typeface.variants && Array.isArray(typeface.variants) && typeface.variants.length > 1) {
          const additionalVariants = typeface.variants
            .filter(variant => variant !== item.typefaceVariant)
            .slice(0, 2); // Suggest up to 2 additional variants
          
          if (additionalVariants.length > 0) {
            const newItems = [
              ...currentItems,
              ...additionalVariants.map(variant => ({
                ...item,
                typefaceVariant: variant,
                typeface: `${item.typefaceFamily} ${variant}`,
                languageCut: getLanguageCutForVariant(variant),
                basePrice: calculateItemPrice(item.typefaceFamily, businessSize, item.licenseType, item.usage),
                amount: calculateItemPrice(item.typefaceFamily, businessSize, item.licenseType, item.usage),
              }))
            ];
            
            const newDiscount = calculateDiscount(newItems, businessSize);
            const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
            const newFinalTotal = newTotal - newDiscount.amount;
            const savings = currentFinalTotal - newFinalTotal;
            
            if (savings > 0) {
              suggestions.push({
                type: 'style',
                description: `Add ${additionalVariants.join(', ')} styles of ${item.typefaceFamily}`,
                potentialSavings: savings,
                items: newItems
              });
            }
          }
        }
      });
    }
    
    // License type bundle suggestions
    const currentLicenseTypes = new Set(currentItems?.map(item => item.licenseType) || []);
    const availableLicenseTypes = getAvailableLicenseTypes(businessSize);
    
    if (availableLicenseTypes && Array.isArray(availableLicenseTypes)) {
      availableLicenseTypes.forEach(licenseType => {
        if (!currentLicenseTypes.has(licenseType.id) && ['web', 'logo'].includes(licenseType.id)) {
          const newItems = [
            ...(currentItems || []),
            ...(currentItems || []).map(item => ({
              ...item,
              licenseType: licenseType.id,
              usage: getBusinessSizeUsage(businessSize), // Use correct function for Desktop/Web/Logo
              basePrice: calculateItemPrice(item.typefaceFamily, businessSize, licenseType.id, getBusinessSizeUsage(businessSize)),
              amount: calculateItemPrice(item.typefaceFamily, businessSize, licenseType.id, getBusinessSizeUsage(businessSize)),
            }))
          ];
          
          const newDiscount = calculateDiscount(newItems, businessSize);
          const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
          const newFinalTotal = newTotal - newDiscount.amount;
          const savings = currentFinalTotal - newFinalTotal;
          
          if (savings > 0) {
            suggestions.push({
              type: 'license',
              description: `Add ${licenseType.name} license for all typefaces`,
              potentialSavings: savings,
              items: newItems
            });
          }
        }
      });
    }
    
    // Typeface bundle suggestions
    const currentTypefaces = new Set(currentItems?.map(item => item.typefaceFamily) || []);
    const popularTypefaces = ['YTF Gióng', 'YTF Millie', 'YTF Oldman', 'YTF Cafuné'];
    
    if (popularTypefaces && Array.isArray(popularTypefaces)) {
      popularTypefaces.forEach(typefaceFamily => {
        if (!currentTypefaces.has(typefaceFamily)) {
          const typeface = ytfTypefaces.find(tf => tf.family === typefaceFamily);
          if (typeface) {
            const newItems = [
              ...(currentItems || []),
              {
                typefaceFamily: typeface.family,
                typefaceVariant: typeface.variants[0] || 'Roman',
                typeface: `${typeface.family} ${typeface.variants[0] || 'Roman'}`,
                languageCut: getLanguageCutForVariant(typeface.variants[0] || 'Roman'),
                basePrice: calculateItemPrice(typeface.family, businessSize, currentItems?.[0]?.licenseType || 'desktop', currentItems?.[0]?.usage || getBusinessSizeUsage(businessSize)),
                amount: calculateItemPrice(typeface.family, businessSize, currentItems?.[0]?.licenseType || 'desktop', currentItems?.[0]?.usage || getBusinessSizeUsage(businessSize)),
                licenseType: currentItems?.[0]?.licenseType || 'desktop',
                usage: currentItems?.[0]?.usage || getBusinessSizeUsage(businessSize),
              }
            ];
            
            const newDiscount = calculateDiscount(newItems, businessSize);
            const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
            const newFinalTotal = newTotal - newDiscount.amount;
            const savings = currentFinalTotal - newFinalTotal;
            
            if (savings > 0) {
              suggestions.push({
                type: 'typeface',
                description: `Add ${typeface.family} to your collection`,
                potentialSavings: savings,
                items: newItems
              });
            }
          }
        }
      });
    }
    
    return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings).slice(0, 3);
  };

  // AI processing function
  const processAiInput = async (input: string) => {
    setIsAiProcessing(true);
    
    try {
      // Try AI parsing first
      const aiResult = await parseWithAI(input);
      
      if (aiResult && aiResult.confidence > 0.7) {
        // Convert AI result to form data
        const items: FormItem[] = aiResult.typefaces.map(tf => {
          const typeface = ytfTypefaces.find(t => t.family === tf.family);
          const style = typeface?.variants.includes(tf.style) ? tf.style : typeface?.variants[0] || 'Roman';
          
          return {
            typefaceFamily: tf.family,
            typefaceVariant: style,
            typeface: `${tf.family} ${style}`,
            languageCut: getLanguageCutForVariant(style),
            basePrice: calculateItemPrice(tf.family, aiResult.businessSize, aiResult.licenseTypes[0], aiResult.usage),
            amount: calculateItemPrice(tf.family, aiResult.businessSize, aiResult.licenseTypes[0], aiResult.usage),
            licenseType: aiResult.licenseTypes[0],
            usage: aiResult.usage
          };
        });

        // Update form data
        setFormData(prev => ({
          ...prev,
          items: items.length > 0 ? items : prev.items,
          businessSize: aiResult.businessSize
        }));

        // Set suggestions
        setAiSuggestions(aiResult.suggestions);

        // Use AI bundle suggestions if available, otherwise generate them
        if (aiResult.bundleSuggestions && aiResult.bundleSuggestions.length > 0) {
          // Convert AI bundle suggestions to the expected format
          const convertedBundles = aiResult.bundleSuggestions.map(bundle => ({
            type: bundle.type,
            description: bundle.description,
            potentialSavings: bundle.potentialSavings,
            items: items // Use the current items for the bundle
          }));
          setAiBundleSuggestions(convertedBundles);
        } else if (items.length > 0) {
          const bundleSuggestions = generateBundleSuggestions(items, aiResult.businessSize);
          setAiBundleSuggestions(bundleSuggestions);
        }
        
        // Update availableVariants
        if (items.length > 0) {
          const newAvailableVariants = items.map(item => {
            const typeface = ytfTypefaces.find(tf => tf.family === item.typefaceFamily);
            return typeface ? typeface.variants : ["Roman", "Italic"];
          });
          setAvailableVariants(newAvailableVariants);
        }

        // Log AI pricing information if available
        if (aiResult.pricing) {
          console.log('AI Pricing Analysis:', aiResult.pricing);
        }

        console.log('AI parsing successful:', aiResult);
      } else {
        // Fallback to rule-based parsing
        console.log('AI confidence too low, using rule-based parsing');
        const parsed = parseAiInput(input);

        setFormData(prev => ({
          ...prev,
          ...parsed.clientInfo,
          items: parsed.items && parsed.items.length > 0 ? parsed.items : prev.items,
          businessSize: parsed.businessSize || prev.businessSize
        }));

        setAiSuggestions(parsed.suggestions);

        if (parsed.items && parsed.items.length > 0) {
          const bundleSuggestions = generateBundleSuggestions(parsed.items, parsed.businessSize);
          setAiBundleSuggestions(bundleSuggestions);
          
          const newAvailableVariants = parsed.items.map(item => {
            const typeface = ytfTypefaces.find(tf => tf.family === item.typefaceFamily);
            return typeface ? typeface.variants : ["Roman", "Italic"];
          });
          setAvailableVariants(newAvailableVariants);
        }
      }
    } catch (error) {
      console.error('Error processing AI input:', error);
      // Fallback to rule-based parsing on error
      const parsed = parseAiInput(input);
      setFormData(prev => ({
        ...prev,
        ...parsed.clientInfo,
        items: parsed.items && parsed.items.length > 0 ? parsed.items : prev.items,
        businessSize: parsed.businessSize || prev.businessSize
      }));
      setAiSuggestions([...parsed.suggestions, 'Note: Using rule-based parsing due to AI service error.']);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Parse AI input to extract form data with full licensing model understanding
  const parseAiInput = (input: string) => {
    const lowerInput = input.toLowerCase();
    const suggestions: string[] = [];
    const clientInfo: Partial<FormData> = {};
    let parsedBusinessSize = 'individual'; // Initialize with default value

    // Style normalization maps for handling ambiguous, misspelled, and invalid styles
    const styleNormalization: Record<string, string> = {
      // Common typos
      'italics': 'italic',
      'reguler': 'regular',
      'bolded': 'bold',
      'normale': 'normal',
      'standart': 'standard',
      'oblique': 'italic',
      'roman': 'regular',
      
      // Ambiguous terms
      'normal': 'regular',
      'standard': 'regular',
      'main': 'regular',
      'body': 'regular',
      'heading': 'regular',
      'default': 'regular',
      
      // Weight variations
      'extrabold': 'bold',
      'semi': 'medium',
      'semibold': 'medium',
      'book': 'regular',
      'display': 'regular', // Not a style, ignore
    };

    // Weight hierarchy for fallback logic
    const weightHierarchy = {
      'thin': 1,
      'ultralight': 2,
      'light': 3,
      'regular': 4,
      'medium': 5,
      'bold': 6,
      'heavy': 7,
      'black': 8,
    };

    // Helper function to normalize style names
    const normalizeStyle = (style: string): string => {
      const normalized = style.toLowerCase().trim();
      return styleNormalization[normalized] || normalized;
    };

    // Helper function to find the best matching style from available styles
    const findBestStyleMatch = (userStyle: string, availableStyles: string[]): { style: string; confidence: 'exact' | 'fuzzy' | 'fallback'; needsConfirmation: boolean } => {
      const normalizedUserStyle = normalizeStyle(userStyle);
      
      // Check for exact match
      const exactMatch = availableStyles.find(style => 
        style.toLowerCase() === normalizedUserStyle
      );
      if (exactMatch) {
        return { style: exactMatch, confidence: 'exact', needsConfirmation: false };
      }

      // Check for contains match (fuzzy)
      const containsMatch = availableStyles.find(style => 
        style.toLowerCase().includes(normalizedUserStyle) || 
        normalizedUserStyle.includes(style.toLowerCase())
      );
      if (containsMatch) {
        return { style: containsMatch, confidence: 'fuzzy', needsConfirmation: true };
      }

      // Fallback logic for ambiguous terms
      if (['italic', 'oblique'].includes(normalizedUserStyle)) {
        // Look for any italic style
        const italicMatch = availableStyles.find(style => 
          style.toLowerCase().includes('italic')
        );
        if (italicMatch) {
          return { style: italicMatch, confidence: 'fallback', needsConfirmation: true };
        }
      }

      if (['bold', 'heavy', 'black', 'extrabold'].includes(normalizedUserStyle)) {
        // Find the heaviest available weight
        const boldStyles = availableStyles.filter(style => 
          ['bold', 'heavy', 'black'].some(weight => 
            style.toLowerCase().includes(weight)
          )
        );
        if (boldStyles.length > 0) {
          // Sort by weight hierarchy and pick the heaviest
          const heaviest = boldStyles.sort((a, b) => {
            const aWeight = Object.keys(weightHierarchy).find(weight => 
              a.toLowerCase().includes(weight)
            );
            const bWeight = Object.keys(weightHierarchy).find(weight => 
              b.toLowerCase().includes(weight)
            );
            return (weightHierarchy[bWeight as keyof typeof weightHierarchy] || 0) - 
                   (weightHierarchy[aWeight as keyof typeof weightHierarchy] || 0);
          })[0];
          return { style: heaviest, confidence: 'fallback', needsConfirmation: true };
        }
      }

      if (['light', 'thin', 'ultralight'].includes(normalizedUserStyle)) {
        // Find the lightest available weight
        const lightStyles = availableStyles.filter(style => 
          ['light', 'thin', 'ultralight'].some(weight => 
            style.toLowerCase().includes(weight)
          )
        );
        if (lightStyles.length > 0) {
          // Sort by weight hierarchy and pick the lightest
          const lightest = lightStyles.sort((a, b) => {
            const aWeight = Object.keys(weightHierarchy).find(weight => 
              a.toLowerCase().includes(weight)
            );
            const bWeight = Object.keys(weightHierarchy).find(weight => 
              b.toLowerCase().includes(weight)
            );
            return (weightHierarchy[aWeight as keyof typeof weightHierarchy] || 0) - 
                   (weightHierarchy[bWeight as keyof typeof weightHierarchy] || 0);
          })[0];
          return { style: lightest, confidence: 'fallback', needsConfirmation: true };
        }
      }

      // Default to first available style
      return { 
        style: availableStyles[0], 
        confidence: 'fallback', 
        needsConfirmation: true 
      };
    };

    // Extract email
    const emailMatch = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      clientInfo.clientEmail = emailMatch[0];
    }

    // Extract company name
    const companyMatch = input.match(/(?:for|at|from)\s+([A-Z][A-Za-z\s&]+?)(?:\s|$|,|\.)/);
    if (companyMatch) {
      clientInfo.billingAddress = {
        ...formData.billingAddress,
        companyName: companyMatch[1].trim(),
      };
    }

    // --- 1. Typeface(s) Parsing ---
    // Improved parsing with style/variant handling
    const items: FormItem[] = [];
    const mentionedTypefaces = new Set<string>();
    const needsConfirmation: string[] = [];

    // Extract typeface families and their mentioned styles
    if (ytfTypefaces && Array.isArray(ytfTypefaces)) {
      ytfTypefaces.forEach(typeface => {
        const familyName = typeface.family.toLowerCase();
        
        // Check if this typeface family is mentioned
        if (lowerInput.includes(familyName)) {
          const availableStyles = typeface.variants;
          const mentionedStyles: string[] = [];
          
          // Look for specific style mentions in the input
          if (availableStyles && Array.isArray(availableStyles)) {
            availableStyles.forEach(style => {
              const styleLower = style.toLowerCase();
              if (lowerInput.includes(styleLower)) {
                mentionedStyles.push(style);
              }
            });

            // If no specific styles mentioned, look for general style terms
            if (mentionedStyles.length === 0) {
              const generalStyleTerms = ['italic', 'bold', 'light', 'thin', 'regular', 'normal', 'medium'];
              if (generalStyleTerms && Array.isArray(generalStyleTerms)) {
                generalStyleTerms.forEach(term => {
                  if (lowerInput.includes(term)) {
                    const match = findBestStyleMatch(term, availableStyles);
                    if (match.confidence !== 'exact') {
                      needsConfirmation.push(`${typeface.family} ${match.style} (interpreted from "${term}")`);
                    }
                    mentionedStyles.push(match.style);
                  }
                });
              }
            }

            // If still no styles found, default to first available style
            if (mentionedStyles.length === 0 && availableStyles.length > 0) {
              mentionedStyles.push(availableStyles[0]);
            }

            // Add each mentioned style as a separate item
            if (mentionedStyles && Array.isArray(mentionedStyles)) {
              mentionedStyles.forEach(style => {
                const itemKey = `${typeface.family}-${style}`;
                if (!mentionedTypefaces.has(itemKey)) {
                  mentionedTypefaces.add(itemKey);
                  items.push({
                    typefaceFamily: typeface.family,
                    typefaceVariant: style,
                    typeface: `${typeface.family} ${style}`,
                    languageCut: getLanguageCutForVariant(style),
                    basePrice: calculateItemPrice(typeface.family, parsedBusinessSize, 'desktop', 'non-commercial'),
                    amount: calculateItemPrice(typeface.family, parsedBusinessSize, 'desktop', 'non-commercial'),
                    licenseType: 'desktop',
                    usage: 'non-commercial'
                  });
                }
              });
            }
          }
        }
      });
    }

    // If no typefaces found, add suggestions
    if (items.length === 0) {
      suggestions.push('Please specify which YTF typefaces you would like to license (e.g., "YTF Gióng", "YTF Xanh Italic")');
    }

    // --- 2. Business Size Parsing ---
    
    // Extract employee count
    const employeeMatch = lowerInput.match(/(\d+)\s*(?:employees?|people|team members?|staff)/);
    if (employeeMatch) {
      const count = parseInt(employeeMatch[1]);
      if (count === 1) {
        parsedBusinessSize = 'individual';
      } else if (count < 20) {
        parsedBusinessSize = 'xs';
      } else if (count < 50) {
        parsedBusinessSize = 's';
      } else if (count < 150) {
        parsedBusinessSize = 'm';
      } else if (count < 250) {
        parsedBusinessSize = 'l';
      } else {
        parsedBusinessSize = 'xl';
      }
    } else {
      // Check for individual indicators
      if (lowerInput.includes('just me') || lowerInput.includes('personal use') || lowerInput.includes('individual')) {
        parsedBusinessSize = 'individual';
      } else {
        suggestions.push('How many employees are in your company?');
      }
    }

    // --- 3. License Types Parsing ---
    const licenseTypes = new Set<string>();
    
    // Always include Desktop license for any use
    licenseTypes.add('desktop');
    
    // Parse usage context for additional licenses
    if (lowerInput.includes('website') || lowerInput.includes('web')) {
      licenseTypes.add('web');
    }
    if (lowerInput.includes('app') || lowerInput.includes('software') || lowerInput.includes('mobile')) {
      licenseTypes.add('app');
    }
    if (lowerInput.includes('logo') || lowerInput.includes('brand identity') || lowerInput.includes('logotype')) {
      licenseTypes.add('logo');
    }
    if (lowerInput.includes('tv') || lowerInput.includes('video') || lowerInput.includes('broadcast')) {
      licenseTypes.add('broadcast');
    }
    if (lowerInput.includes('packaging') || lowerInput.includes('label')) {
      licenseTypes.add('packaging');
    }
    if (lowerInput.includes('tote') || lowerInput.includes('shirt') || lowerInput.includes('merchandise')) {
      licenseTypes.add('merchandising');
    }
    if (lowerInput.includes('book') || lowerInput.includes('editorial') || lowerInput.includes('publishing')) {
      licenseTypes.add('publishing');
    }

    // Apply license types to all items
    if (items && Array.isArray(items)) {
      items.forEach(item => {
        item.licenseType = Array.from(licenseTypes)[0]; // Use first license type for now
      });
    }

         // --- 4. Usage Tiers Parsing ---
     let parsedUsage = 'non-commercial';
     
     if (parsedBusinessSize !== 'individual') {
       // Parse usage context for commercial tiers
       if (lowerInput.includes('under 5000') || lowerInput.includes('small run')) {
         parsedUsage = 'under-5k';
       } else if (lowerInput.includes('under 50000') || lowerInput.includes('medium run')) {
         parsedUsage = 'under-50k';
       } else if (lowerInput.includes('under 500000') || lowerInput.includes('large run')) {
         parsedUsage = 'under-500k';
       } else {
         // Default to smallest commercial tier
         parsedUsage = 'under-5k';
       }
     }

     // Apply usage to all items
     if (items && Array.isArray(items)) {
       items.forEach(item => {
         item.usage = parsedUsage;
       });
     }

    // Add confirmation suggestions if needed
    if (needsConfirmation.length > 0) {
      suggestions.push(`Please confirm these style selections: ${needsConfirmation.join(', ')}`);
    }

         return {
       items,
       businessSize: parsedBusinessSize,
       clientInfo,
       suggestions
     };
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
      <div className="container mx-auto px-4 py-4 md:pb-0 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: Form */}
          <div className="w-full lg:w-3/5 lg:pt-0">
            <Card className="bg-transparent shadow-none border-0">
              <CardContent className="p-0">
                {/* Form content */}
                <Card className="p-0 rounded-none bg-transparent shadow-none border-0 mb-6">
                  <CardHeader className="p-0">
                    <div className="flex flex-row items-center justify-between w-full mb-6 gap-x-4">
                      <SectionHeader 
                        title={`QUOTATION NO. ${formData.quotationNumber}`} 
                      />
                      {/* Mode Switcher right-aligned on same row */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`font-grand text-[14px] px-3 py-1 border border-black transition-colors duration-150 ${mode === 'manual' ? 'bg-black text-white' : 'bg-white text-black'} rounded-l-md ${mode === 'manual' ? '' : 'border-r-0'} focus:z-10`}
                          style={{ fontFamily: 'YTF Grand 123, monospace', padding: '4px 12px', fontSize: 14, fontWeight: 400, borderTopRightRadius: 0, borderBottomRightRadius: 0, height: '36px' }}
                          onClick={() => {
                            setMode('manual');
                            setAiSuggestions([]);
                            setAiBundleSuggestions([]);
                            setAiInput('');
                          }}
                          aria-pressed={mode === 'manual'}
                        >
                          Manual
                        </button>
                        <button
                          type="button"
                          className={`font-grand text-[14px] px-3 py-1 border-black transition-colors duration-150 ${mode === 'ai' ? 'bg-black text-white border' : 'bg-white text-black border'} rounded-r-md ${mode === 'ai' ? '' : 'border-l-0'} focus:z-10`}
                          style={{ fontFamily: 'YTF Grand 123, monospace', padding: '4px 12px', fontSize: 14, fontWeight: 400, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, height: '36px' }}
                          onClick={() => { 
                            setMode('ai'); 
                            setAiSuggestions([]);
                            setAiBundleSuggestions([]);
                            setAiInput('');
                            console.log('AI mode selected'); 
                          }}
                          aria-pressed={mode === 'ai'}
                        >
                          AI
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {mode === 'manual' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="CLIENT NAME *"
                          name="clientName"
                          value={formData.clientName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="Herb Lubalin"
                          required
                          autoComplete="off"
                          error={errors.clientName}
                          touched={touchedFields.clientName}
                        />
                        <InputField
                          label="EMAIL *"
                          name="clientEmail"
                          value={formData.clientEmail}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="name@email.com"
                          required
                          autoComplete="email"
                          error={errors.clientEmail}
                          touched={touchedFields.clientEmail}
                        />
                        <InputField
                          label="COMPANY NAME"
                          name="billingAddress.companyName"
                          value={formData.billingAddress.companyName}
                          onChange={handleInputChange}
                          placeholder="Company name"
                          autoComplete="organization"
                        />
                        <div>
                          <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
                            <label htmlFor="businessSize" className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
                              BUSINESS SIZE <span className="text-red-500">*</span>
                            </label>
                            <Select
                              value={formData.businessSize}
                              onValueChange={handleBusinessSizeChange}
                              name="businessSize"
                            >
                              <SelectTrigger id="businessSize" className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '14px', lineHeight: '1.4', height: '18px', padding: 0 }}>
                                <SelectValue placeholder="Select Business Size" />
                              </SelectTrigger>
                              <SelectContent>
                                {businessSizes.map((size) => (
                                  <SelectItem key={size.id} value={size.id}>
                                    {size.name}{size.multiplier ? ` (${size.multiplier}×)` : ""}{size.description ? ` – ${size.description}` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {errors.businessSize && touchedFields.businessSize && (
                            <div className="ytf-form-error mt-1">{errors.businessSize}</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center border-b-[0.5px] border-black pb-[12px] w-full" style={{ gap: '12px' }}>
                            <label htmlFor="billingAddress.country" className="ytf-form-label uppercase flex-shrink-0 inline-flex items-center" style={{ minHeight: '21px' }}>
                              COUNTRY
                            </label>
                            <Select
                              value={formData.billingAddress.country}
                              onValueChange={handleCountryChange}
                              name="billingAddress.country"
                            >
                              <SelectTrigger id="billingAddress.country" className="ytf-form-input flex-1 w-full bg-transparent border-none !border-b-0 outline-none placeholder:ytf-form-input" style={{ fontFamily: 'YTF Grand 123, monospace', fontSize: '14px', lineHeight: '1.4', height: '18px', padding: 0 }}>
                                <SelectValue placeholder="Select Country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AF">Afghanistan</SelectItem>
                                <SelectItem value="AL">Albania</SelectItem>
                                <SelectItem value="DZ">Algeria</SelectItem>
                                <SelectItem value="AD">Andorra</SelectItem>
                                <SelectItem value="AO">Angola</SelectItem>
                                <SelectItem value="AG">Antigua and Barbuda</SelectItem>
                                <SelectItem value="AR">Argentina</SelectItem>
                                <SelectItem value="AM">Armenia</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="AT">Austria</SelectItem>
                                <SelectItem value="AZ">Azerbaijan</SelectItem>
                                <SelectItem value="BS">Bahamas</SelectItem>
                                <SelectItem value="BH">Bahrain</SelectItem>
                                <SelectItem value="BD">Bangladesh</SelectItem>
                                <SelectItem value="BB">Barbados</SelectItem>
                                <SelectItem value="BY">Belarus</SelectItem>
                                <SelectItem value="BE">Belgium</SelectItem>
                                <SelectItem value="BZ">Belize</SelectItem>
                                <SelectItem value="BJ">Benin</SelectItem>
                                <SelectItem value="BT">Bhutan</SelectItem>
                                <SelectItem value="BO">Bolivia</SelectItem>
                                <SelectItem value="BA">Bosnia and Herzegovina</SelectItem>
                                <SelectItem value="BW">Botswana</SelectItem>
                                <SelectItem value="BR">Brazil</SelectItem>
                                <SelectItem value="BN">Brunei</SelectItem>
                                <SelectItem value="BG">Bulgaria</SelectItem>
                                <SelectItem value="BF">Burkina Faso</SelectItem>
                                <SelectItem value="BI">Burundi</SelectItem>
                                <SelectItem value="KH">Cambodia</SelectItem>
                                <SelectItem value="CM">Cameroon</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="CV">Cape Verde</SelectItem>
                                <SelectItem value="CF">Central African Republic</SelectItem>
                                <SelectItem value="TD">Chad</SelectItem>
                                <SelectItem value="CL">Chile</SelectItem>
                                <SelectItem value="CN">China</SelectItem>
                                <SelectItem value="CO">Colombia</SelectItem>
                                <SelectItem value="KM">Comoros</SelectItem>
                                <SelectItem value="CG">Congo</SelectItem>
                                <SelectItem value="CR">Costa Rica</SelectItem>
                                <SelectItem value="HR">Croatia</SelectItem>
                                <SelectItem value="CU">Cuba</SelectItem>
                                <SelectItem value="CY">Cyprus</SelectItem>
                                <SelectItem value="CZ">Czech Republic</SelectItem>
                                <SelectItem value="DK">Denmark</SelectItem>
                                <SelectItem value="DJ">Djibouti</SelectItem>
                                <SelectItem value="DM">Dominica</SelectItem>
                                <SelectItem value="DO">Dominican Republic</SelectItem>
                                <SelectItem value="EC">Ecuador</SelectItem>
                                <SelectItem value="EG">Egypt</SelectItem>
                                <SelectItem value="SV">El Salvador</SelectItem>
                                <SelectItem value="GQ">Equatorial Guinea</SelectItem>
                                <SelectItem value="ER">Eritrea</SelectItem>
                                <SelectItem value="EE">Estonia</SelectItem>
                                <SelectItem value="ET">Ethiopia</SelectItem>
                                <SelectItem value="FJ">Fiji</SelectItem>
                                <SelectItem value="FI">Finland</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                                <SelectItem value="GA">Gabon</SelectItem>
                                <SelectItem value="GM">Gambia</SelectItem>
                                <SelectItem value="GE">Georgia</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="GH">Ghana</SelectItem>
                                <SelectItem value="GR">Greece</SelectItem>
                                <SelectItem value="GD">Grenada</SelectItem>
                                <SelectItem value="GT">Guatemala</SelectItem>
                                <SelectItem value="GN">Guinea</SelectItem>
                                <SelectItem value="GW">Guinea-Bissau</SelectItem>
                                <SelectItem value="GY">Guyana</SelectItem>
                                <SelectItem value="HT">Haiti</SelectItem>
                                <SelectItem value="HN">Honduras</SelectItem>
                                <SelectItem value="HU">Hungary</SelectItem>
                                <SelectItem value="IS">Iceland</SelectItem>
                                <SelectItem value="IN">India</SelectItem>
                                <SelectItem value="ID">Indonesia</SelectItem>
                                <SelectItem value="IR">Iran</SelectItem>
                                <SelectItem value="IQ">Iraq</SelectItem>
                                <SelectItem value="IE">Ireland</SelectItem>
                                <SelectItem value="IL">Israel</SelectItem>
                                <SelectItem value="IT">Italy</SelectItem>
                                <SelectItem value="JM">Jamaica</SelectItem>
                                <SelectItem value="JP">Japan</SelectItem>
                                <SelectItem value="JO">Jordan</SelectItem>
                                <SelectItem value="KZ">Kazakhstan</SelectItem>
                                <SelectItem value="KE">Kenya</SelectItem>
                                <SelectItem value="KI">Kiribati</SelectItem>
                                <SelectItem value="KP">North Korea</SelectItem>
                                <SelectItem value="KR">South Korea</SelectItem>
                                <SelectItem value="KW">Kuwait</SelectItem>
                                <SelectItem value="KG">Kyrgyzstan</SelectItem>
                                <SelectItem value="LA">Laos</SelectItem>
                                <SelectItem value="LV">Latvia</SelectItem>
                                <SelectItem value="LB">Lebanon</SelectItem>
                                <SelectItem value="LS">Lesotho</SelectItem>
                                <SelectItem value="LR">Liberia</SelectItem>
                                <SelectItem value="LY">Libya</SelectItem>
                                <SelectItem value="LI">Liechtenstein</SelectItem>
                                <SelectItem value="LT">Lithuania</SelectItem>
                                <SelectItem value="LU">Luxembourg</SelectItem>
                                <SelectItem value="MG">Madagascar</SelectItem>
                                <SelectItem value="MW">Malawi</SelectItem>
                                <SelectItem value="MY">Malaysia</SelectItem>
                                <SelectItem value="MV">Maldives</SelectItem>
                                <SelectItem value="ML">Mali</SelectItem>
                                <SelectItem value="MT">Malta</SelectItem>
                                <SelectItem value="MH">Marshall Islands</SelectItem>
                                <SelectItem value="MR">Mauritania</SelectItem>
                                <SelectItem value="MU">Mauritius</SelectItem>
                                <SelectItem value="MX">Mexico</SelectItem>
                                <SelectItem value="FM">Micronesia</SelectItem>
                                <SelectItem value="MD">Moldova</SelectItem>
                                <SelectItem value="MC">Monaco</SelectItem>
                                <SelectItem value="MN">Mongolia</SelectItem>
                                <SelectItem value="ME">Montenegro</SelectItem>
                                <SelectItem value="MA">Morocco</SelectItem>
                                <SelectItem value="MZ">Mozambique</SelectItem>
                                <SelectItem value="MM">Myanmar</SelectItem>
                                <SelectItem value="NA">Namibia</SelectItem>
                                <SelectItem value="NR">Nauru</SelectItem>
                                <SelectItem value="NP">Nepal</SelectItem>
                                <SelectItem value="NL">Netherlands</SelectItem>
                                <SelectItem value="NZ">New Zealand</SelectItem>
                                <SelectItem value="NI">Nicaragua</SelectItem>
                                <SelectItem value="NE">Niger</SelectItem>
                                <SelectItem value="NG">Nigeria</SelectItem>
                                <SelectItem value="NO">Norway</SelectItem>
                                <SelectItem value="OM">Oman</SelectItem>
                                <SelectItem value="PK">Pakistan</SelectItem>
                                <SelectItem value="PW">Palau</SelectItem>
                                <SelectItem value="PS">Palestine</SelectItem>
                                <SelectItem value="PA">Panama</SelectItem>
                                <SelectItem value="PG">Papua New Guinea</SelectItem>
                                <SelectItem value="PY">Paraguay</SelectItem>
                                <SelectItem value="PE">Peru</SelectItem>
                                <SelectItem value="PH">Philippines</SelectItem>
                                <SelectItem value="PL">Poland</SelectItem>
                                <SelectItem value="PT">Portugal</SelectItem>
                                <SelectItem value="QA">Qatar</SelectItem>
                                <SelectItem value="RO">Romania</SelectItem>
                                <SelectItem value="RU">Russia</SelectItem>
                                <SelectItem value="RW">Rwanda</SelectItem>
                                <SelectItem value="KN">Saint Kitts and Nevis</SelectItem>
                                <SelectItem value="LC">Saint Lucia</SelectItem>
                                <SelectItem value="VC">Saint Vincent and the Grenadines</SelectItem>
                                <SelectItem value="WS">Samoa</SelectItem>
                                <SelectItem value="SM">San Marino</SelectItem>
                                <SelectItem value="ST">São Tomé and Príncipe</SelectItem>
                                <SelectItem value="SA">Saudi Arabia</SelectItem>
                                <SelectItem value="SN">Senegal</SelectItem>
                                <SelectItem value="RS">Serbia</SelectItem>
                                <SelectItem value="SC">Seychelles</SelectItem>
                                <SelectItem value="SL">Sierra Leone</SelectItem>
                                <SelectItem value="SG">Singapore</SelectItem>
                                <SelectItem value="SK">Slovakia</SelectItem>
                                <SelectItem value="SI">Slovenia</SelectItem>
                                <SelectItem value="SB">Solomon Islands</SelectItem>
                                <SelectItem value="SO">Somalia</SelectItem>
                                <SelectItem value="ZA">South Africa</SelectItem>
                                <SelectItem value="SS">South Sudan</SelectItem>
                                <SelectItem value="ES">Spain</SelectItem>
                                <SelectItem value="LK">Sri Lanka</SelectItem>
                                <SelectItem value="SD">Sudan</SelectItem>
                                <SelectItem value="SR">Suriname</SelectItem>
                                <SelectItem value="SE">Sweden</SelectItem>
                                <SelectItem value="CH">Switzerland</SelectItem>
                                <SelectItem value="SY">Syria</SelectItem>
                                <SelectItem value="TW">Taiwan</SelectItem>
                                <SelectItem value="TJ">Tajikistan</SelectItem>
                                <SelectItem value="TZ">Tanzania</SelectItem>
                                <SelectItem value="TH">Thailand</SelectItem>
                                <SelectItem value="TL">Timor-Leste</SelectItem>
                                <SelectItem value="TG">Togo</SelectItem>
                                <SelectItem value="TO">Tonga</SelectItem>
                                <SelectItem value="TT">Trinidad and Tobago</SelectItem>
                                <SelectItem value="TN">Tunisia</SelectItem>
                                <SelectItem value="TR">Turkey</SelectItem>
                                <SelectItem value="TM">Turkmenistan</SelectItem>
                                <SelectItem value="TV">Tuvalu</SelectItem>
                                <SelectItem value="UG">Uganda</SelectItem>
                                <SelectItem value="UA">Ukraine</SelectItem>
                                <SelectItem value="AE">United Arab Emirates</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="UY">Uruguay</SelectItem>
                                <SelectItem value="UZ">Uzbekistan</SelectItem>
                                <SelectItem value="VU">Vanuatu</SelectItem>
                                <SelectItem value="VA">Vatican City</SelectItem>
                                <SelectItem value="VE">Venezuela</SelectItem>
                                <SelectItem value="VN">Vietnam</SelectItem>
                                <SelectItem value="YE">Yemen</SelectItem>
                                <SelectItem value="ZM">Zambia</SelectItem>
                                <SelectItem value="ZW">Zimbabwe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <InputField
                          label="CITY"
                          name="billingAddress.city"
                          value={formData.billingAddress.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          autoComplete="address-level2"
                        />
                        <InputField
                          label="STREET"
                          name="billingAddress.street"
                          value={formData.billingAddress.street}
                          onChange={handleInputChange}
                          placeholder="Street"
                          autoComplete="address-line1"
                        />
                        <InputField
                          label="POST CODE"
                          name="billingAddress.postalCode"
                          value={formData.billingAddress.postalCode}
                          onChange={handleInputChange}
                          placeholder="Post code"
                          autoComplete="postal-code"
                        />
                      </div>
                    ) : (
                      <div className="w-full mt-4 space-y-4">
                        {/* AI Input Interface */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-grand text-[14px] text-gray-600">AI Assistant</span>
                          </div>
                          
                                                     <textarea
                             className="w-full border border-outlinePrimary rounded-md p-4 text-[14px] font-grand resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                             rows={4}
                             placeholder="Describe your typeface needs in natural language. For example:&#10;&#10;• 'I need YTF Gióng for a web project, 15 employees, commercial use'&#10;• 'Looking for a display font for my startup logo, around 10 people'&#10;• 'Need fonts for a book project, individual license'&#10;• 'Want to use YTF Grand 123 for mobile app, 50 employees'"
                             value={aiInput}
                             onChange={(e) => setAiInput(e.target.value)}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                 e.preventDefault();
                                 if (aiInput.trim() && !isAiProcessing) {
                                   processAiInput(aiInput);
                                 }
                               }
                             }}
                             disabled={isAiProcessing}
                           />
                          
                          <div className="flex items-center justify-between">
                            <div className="text-muted-foreground text-[13px]">
                              {isAiProcessing ? 'Processing your request...' : 'Press Enter or click Process to analyze'}
                            </div>
                            
                            <button
                              onClick={() => processAiInput(aiInput)}
                              disabled={!aiInput.trim() || isAiProcessing}
                              className="px-4 py-2 bg-black text-white font-grand text-[14px] rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isAiProcessing ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Processing...
                                </div>
                              ) : (
                                'Process'
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* AI Suggestions */}
                        {aiSuggestions.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-grand text-[14px] text-gray-600">Suggestions:</div>
                            {aiSuggestions.map((suggestion, index) => (
                              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="font-grand text-[14px] text-gray-700">{suggestion}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Bundle Suggestions */}
                        {aiBundleSuggestions.length > 0 && (
                          <div className="space-y-2">
                            <div className="font-grand text-[14px] text-gray-600">💡 Smart Bundle Suggestions:</div>
                            {aiBundleSuggestions.map((bundle, index) => (
                              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-grand text-[14px] text-gray-700 font-medium">{bundle.description}</p>
                                  <span className="font-grand text-[13px] text-green-700 font-medium">
                                    Save ${bundle.potentialSavings}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      items: bundle.items || prev.items
                                    }));
                                    
                                    // Update availableVariants for the bundle items
                                    if (bundle.items && bundle.items.length > 0) {
                                      const newAvailableVariants = bundle.items.map(item => {
                                        const typeface = ytfTypefaces.find(tf => tf.family === item.typefaceFamily);
                                        return typeface ? typeface.variants : ["Roman", "Italic"];
                                      });
                                      setAvailableVariants(newAvailableVariants);
                                    }
                                    
                                    setAiBundleSuggestions([]);
                                  }}
                                  className="text-[12px] font-grand bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                                >
                                  Apply Bundle
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Licensing Model Info */}
                        {/* Removed Licensing Model panel for AI tab as requested */}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="p-0 rounded-none bg-transparent shadow-none border-0 mb-6">
                  <CardContent className="p-0 mb-16">
                    {mode === 'manual' && (
                      <div className="flex flex-col gap-1">
                        {formData.items && formData.items.map((item, index) => (
                          <TypefaceItem
                            key={index}
                            index={index}
                            item={item}
                            availableVariants={availableVariants[index] || []}
                            ytfTypefaces={ytfTypefaces}
                            businessSize={formData.businessSize}
                            errors={errors.items[index]}
                            touched={touchedFields.items[index]}
                            onRemove={() => removeItem(index)}
                            onSelectChange={(field, value) => handleSelectChange(index, field as keyof FormItem, value)}
                            onBlur={(field, value: any) => {
                              let stringValue: string;
                              if (Array.isArray(value)) {
                                stringValue = value.join(',');
                              } else if (typeof value === 'number') {
                                stringValue = value.toString();
                              } else {
                                stringValue = value as string;
                              }
                              handleItemBlur(index, field as keyof FormItem, stringValue);
                            }}
                            canRemove={formData.items ? formData.items.length > 1 : false}
                          />
                        ))}
                      </div>
                    )}
                    {mode === 'manual' && (
                      <Button
                        variant="ghost"
                        onClick={addItem}
                        className="mt-1 p-0 h-auto hover:bg-transparent hover:opacity-40 transition-opacity duration-150 ease-in-out font-oldman text-[32px] tracking-[0em] uppercase leading-[1] md:leading-normal text-left"
                      >
                        + Add Typeface
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>

          {/* Right column: PDF Preview and Export */}
          <div className="w-full lg:w-2/5">
            <div className="lg:sticky lg:top-10 pb-16 md:pb-16 pb-[64px]">
              <div className="hidden md:block">
                <Card className="p-0 rounded-none bg-transparent shadow-none border-0">
                  <CardContent className="p-0">
                    {isClient ? (
                      <PDFPreview formData={formData} />
                    ) : (
                      <div className="w-full aspect-[1/1.414] bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-yellow-500" />
                          <p className="text-sm text-muted-foreground">Loading preview...</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*
         Sticky bottom nav bar:
         - Always visible, never overlaps content
         - h-14 (56px), matches pb-[56px] on page wrapper
         - py-0 for compactness
      */}
      <div className="fixed bottom-0 z-50 bg-white border-t-2 border-outlinePrimary/40 shadow-lg flex items-center w-full py-2">
        <div className="container mx-auto px-4 flex items-center justify-between h-full">
          <div className="flex flex-col w-full flex-wrap items-start text-left gap-0.5 sm:gap-0 sm:w-auto sm:flex-row sm:items-center sm:text-center">
            <span className="font-oldman text-[2rem] sm:text-[2.5rem] font-bold tracking-[0em] uppercase leading-[1] sm:leading-normal break-words">
              {formData.items ? formData.items.length : 0} {formData.items && formData.items.length === 1 ? 'TYPEFACE' : 'TYPEFACES'}
            </span>
            <span className="font-oldman text-[2rem] sm:text-[2.5rem] font-bold tracking-[0em] uppercase leading-[1] sm:leading-normal sm:ml-2 break-words">
              {formData.businessSize === 'individual' ? 'INDIVIDUAL LICENSE' : `BUSINESS LICENSE – ${businessSizes.find(size => size.id === formData.businessSize)?.name.split(' ')[0]}`}
            </span>
            <span className="font-oldman text-[2rem] sm:text-[2.5rem] font-bold tracking-[0em] uppercase leading-[1] sm:leading-normal sm:ml-2 break-words">
              ${formData.total} TOTAL
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={generatePDF}
            disabled={isGenerating || !isFormValid()}
            className="p-0 h-auto hover:bg-transparent hover:opacity-70 transition-opacity font-oldman text-[2rem] sm:text-[2.5rem] font-bold tracking-[0em] uppercase leading-[1] sm:leading-normal disabled:opacity-40"
          >
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
