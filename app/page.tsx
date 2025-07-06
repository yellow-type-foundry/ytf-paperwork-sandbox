"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { FileText } from "lucide-react"

export default function PaperworkDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Yellow Type Foundry</h1>
        <p className="text-xl text-muted-foreground mt-2">Document Generator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quotation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create professional quotations for typeface licensing with automatic pricing calculations and PDF generation.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600">
              <Link href="/quotation">Generate Quotation</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>EULA Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create comprehensive EULAs with customizable terms and conditions for your typeface licenses.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600">
              <Link href="/eula-editor">Edit EULA</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
