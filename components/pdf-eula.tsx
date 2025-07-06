import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { businessSizes } from "@/utils/typeface-data"
import "../styles/typography.css"

const formSchema = z.object({
  licenseHolder: z.object({
    companyName: z.string().min(1, "Company name is required"),
    brandName: z.string().min(1, "Brand name is required"),
    address: z.string().min(1, "Address is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    contactName: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address"),
  }),
  billingParty: z.object({
    companyName: z.string().min(1, "Company name is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    address: z.string().min(1, "Address is required"),
    contactName: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email address"),
  }),
  licenseInfo: z.object({
    date: z.string().min(1, "Date is required"),
    licenseNo: z.string().min(1, "License number is required"),
  }),
  licenseDetails: z.object({
    fontName: z.string().min(1, "Font name is required"),
    languages: z.string().min(1, "Languages are required"),
    styles: z.string().min(1, "Styles are required"),

    licenseDuration: z.string().min(1, "License duration is required"),
    licenseHolderBusinessSize: z.string().min(1, "Business size is required"),
    grantedLicense: z.string().min(1, "Granted license is required"),
    totalFeeVND: z.string().min(1, "VND fee is required"),
    totalFeeUSD: z.string().min(1, "USD fee is required"),
    licenseExtensions: z.object({
      included: z.string().min(1, "Included extensions are required"),
      excluded: z.string().min(1, "Excluded extensions are required"),
    }),
  }),
})

type LicenseFormData = z.infer<typeof formSchema>

function EulaPreview({ formData }: { formData: LicenseFormData }) {
  if (!formData.licenseHolder.companyName) {
    return (
      <div className="w-full aspect-[1/1.414] bg-muted rounded-md flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Fill out the form to see a preview</p>
      </div>
    )
  }

  // Get the selected business size
  const selectedBusinessSize = businessSizes.find((size) => size.id === formData.licenseDetails.licenseHolderBusinessSize)

  // Format today's date
  const formattedDate = new Date(formData.licenseInfo.date)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase()

  // Helper function to determine typeface style class
  const getTypefaceStyleClass = (typefaceFamily: string) => {
    if (typefaceFamily.includes("Eon")) return "ytf-eon"
    if (typefaceFamily.includes("Cafuné")) return "ytf-cafune"
    if (typefaceFamily.includes("Gióng")) return "ytf-giong"
    if (typefaceFamily.includes("Millie")) return "ytf-millie"
    return ""
  }

  return (
    <div className="w-full aspect-[1/1.414] rounded-md shadow-sm overflow-hidden border">
      <div
        className="p-6 text-xs text-black relative ytf-bg"
        style={{
          transform: "scale(0.7)",
          transformOrigin: "top left",
          width: "143%",
          height: "143%",
        }}
      >
        {/* YTF Logo */}
        <div className="flex justify-between items-center mb-12 pt-6" style={{ height: '32px' }}>
          <div className="w-1/3"></div>
          <div className="text-center w-1/3">
            <img src="/YTF-LOGO.svg" alt="YTF Logo" style={{ display: 'inline-block', height: 32, width: 'auto', margin: '0 auto' }} />
          </div>
          <div className="w-1/3"></div>
        </div>

        {/* Header information */}
        <div className="flex justify-between mb-12">
          <span className="ytf-label">YELLOW TYPE FOUNDRY</span>
          <span className="ytf-label">LICENSE NO. {formData.licenseInfo.licenseNo}</span>
          <span className="ytf-label">ISSUED ON {formattedDate}</span>
        </div>

        {/* Main title */}
        <h1 className="ytf-title mb-12 mt-8">TYPEFACE LICENSING AGREEMENT</h1>

        {/* Business Size Information */}
        {selectedBusinessSize && (
          <div className="mb-6">
            <h2 className="text-lg font-bold">{selectedBusinessSize.name} License</h2>
            <p className="text-xs">{selectedBusinessSize.description}</p>
          </div>
        )}

        {/* Provider and client sections */}
        <div className="flex justify-between mb-12">
          <div>
            <p className="ytf-label mb-2">LICENSE PROVIDER</p>
            <p className="ytf-body">Yellow Type Foundry Company Ltd.</p>
            <p className="ytf-body">No.6, Lane 36, Nguyen Hong Street</p>
            <p className="ytf-body">Lang Ha Ward, Dong Da District, Hanoi, Vietnam</p>
            <p className="ytf-body">Tax ID: 0109884491</p>
          </div>

          <div className="text-right">
            <p className="ytf-label mb-2">LICENSE HOLDER</p>
            <p className="ytf-body">{formData.licenseHolder.companyName}</p>
            {formData.licenseHolder.brandName && <p className="ytf-body">Brand: {formData.licenseHolder.brandName}</p>}
            <p className="ytf-body">{formData.licenseHolder.contactName}</p>
            <p className="ytf-body">{formData.licenseHolder.email}</p>
            <p className="ytf-body">{formData.licenseHolder.address}</p>
            <p className="ytf-body">Tax ID: {formData.licenseHolder.taxId}</p>
          </div>
        </div>

        {/* Billing Party Information */}
        <div className="mb-12">
          <p className="ytf-label mb-2">BILLING PARTY</p>
          <p className="ytf-body">{formData.billingParty.companyName}</p>
          <p className="ytf-body">{formData.billingParty.contactName}</p>
          <p className="ytf-body">{formData.billingParty.email}</p>
          <p className="ytf-body">{formData.billingParty.address}</p>
          <p className="ytf-body">Tax ID: {formData.billingParty.taxId}</p>
        </div>

        {/* License Details */}
        <div className="mb-8 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-1 ytf-label">TYPEFACE</th>
                <th className="text-left p-1 ytf-label">LANGUAGES/STYLES</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className={`p-1 ytf-body ${getTypefaceStyleClass(formData.licenseDetails.fontName)}`}>
                  {formData.licenseDetails.fontName}
                </td>
                <td className="p-1 ytf-body">{formData.licenseDetails.languages}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between">
            <span className="ytf-label">TOTAL FEE (VND)</span>
            <span className="ytf-subtotal">{formData.licenseDetails.totalFeeVND}</span>
          </div>
          <div className="flex justify-between mt-8">
            <span className="ytf-total">Total (USD):</span>
            <span className="ytf-total">{formData.licenseDetails.totalFeeUSD}</span>
          </div>
        </div>

        {/* Extensions */}
        <div className="mt-12">
          <div className="mb-4">
            <p className="ytf-label mb-2">INCLUDED EXTENSIONS:</p>
            <p className="ytf-body">{formData.licenseDetails.licenseExtensions.included}</p>
          </div>
          <div>
            <p className="ytf-label mb-2">EXCLUDED EXTENSIONS:</p>
            <p className="ytf-body">{formData.licenseDetails.licenseExtensions.excluded}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-16 text-center">
          <p className="ytf-label mb-2">NOTES:</p>
          <p className="ytf-body max-w-md mx-auto">
            All offers and license agreements from Yellow Type Foundry are governed exclusively by Yellow Type Foundry's
            General Terms and Conditions (EULA), with any conflicting terms from the licensees' general conditions
            expressly excluded.
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6">
          <span className="ytf-footer">©2025 YELLOW TYPE FOUNDRY</span>
          <span className="ytf-footer">YELLOWTYPE.COM</span>
          <span className="ytf-footer">STRICTLY CONFIDENTIAL</span>
        </div>
      </div>
    </div>
  )
}

export function PDFEula() {
  const form = useForm<LicenseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licenseHolder: {
        companyName: "",
        brandName: "",
        address: "",
        taxId: "",
        contactName: "",
        email: "",
      },
      billingParty: {
        companyName: "",
        taxId: "",
        address: "",
        contactName: "",
        email: "",
      },
      licenseInfo: {
        date: new Date().toISOString().split("T")[0],
        licenseNo: "",
      },
      licenseDetails: {
        fontName: "",
        languages: "",
        styles: "",

        licenseDuration: "",
        licenseHolderBusinessSize: "",
        grantedLicense: "",
        totalFeeVND: "",
        totalFeeUSD: "",
        licenseExtensions: {
          included: "",
          excluded: "",
        },
      },
    },
  })

  function onSubmit(values: LicenseFormData) {
    console.log(values)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* License Holder Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">License Holder</h2>
                <FormField
                  control={form.control}
                  name="licenseHolder.companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseHolder.brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseHolder.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseHolder.taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseHolder.contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseHolder.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Billing Party Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Billing Party</h2>
                <FormField
                  control={form.control}
                  name="billingParty.companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingParty.taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingParty.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingParty.contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingParty.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* License Info Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">License Information</h2>
                <FormField
                  control={form.control}
                  name="licenseInfo.date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseInfo.licenseNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* License Details Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">License Details</h2>
                <FormField
                  control={form.control}
                  name="licenseDetails.fontName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseDetails.languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseDetails.styles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Styles</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseDetails.licenseDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Duration</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseDetails.licenseHolderBusinessSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Size</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseDetails.grantedLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Granted License</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseDetails.totalFeeVND"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Fee (VND)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseDetails.totalFeeUSD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Fee (USD)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <h3 className="text-md font-semibold">License Extensions</h3>
                  <FormField
                    control={form.control}
                    name="licenseDetails.licenseExtensions.included"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Included Extensions</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseDetails.licenseExtensions.excluded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Excluded Extensions</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit">Generate EULA</Button>
            </form>
          </Form>
        </div>

        {/* Preview Section */}
        <div className="sticky top-4">
          <EulaPreview formData={form.watch()} />
        </div>
      </div>
    </div>
  )
} 