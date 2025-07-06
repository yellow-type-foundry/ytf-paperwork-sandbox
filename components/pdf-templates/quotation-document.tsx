"use client"
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path } from "@react-pdf/renderer"
import { QuotationData } from "@/types"
import { businessSizes, licenseTypes, usageOptions } from "../../utils/typeface-data"

// Define types
interface BusinessSize {
  name: string
  description: string
}

interface QuotationItem {
  typeface: string
  licenseType: string
  usage: string
  amount: number
}

// Register fonts
Font.register({
  family: "YTF Oldman",
  src: "/fonts/YTFOldman-Bold.ttf",
  fontWeight: "bold"
})

Font.register({
  family: "YTF Vang Mono",
  src: "/fonts/YTFVangMono-Regular.ttf",
  fontWeight: "normal"
})

Font.register({
  family: "YTF Grand 123",
  src: "/fonts/YTFGrand123-Regular.ttf",
  fontWeight: "normal"
})

// Register YTF Grand 123 Light
Font.register({
  family: "YTF Grand 123 Light",
  src: "/fonts/YTFGrand123-Light.ttf",
  fontWeight: "light"
})

// Value tokens
const COLORS = {
  bgPrimary: "#E8EADD",
  bgSecondary: "#F4F6E9",
  infoBlock: "#E8EADD",
  tableHeader: "#E8EADD",
  totalSection: "#F4F6E9",
  border: "#D6D3D1",
  outlinePrimary: "#CCD0B3",
  contentSecondary: "#7E7E4E",
  contentPrimary: "#000000",
};
const SPACING = {
  pagePadding: 0,
  horizontal: 4,
  vertical: 4,
  gap: 4,
  borderRadius: 4,
};

// PDF text styles namespace
const textStyles = {
  pdf: {
    footnote: {
      fontFamily: 'YTF Vang Mono',
      fontSize: 5,
      lineHeight: 1,
      letterSpacing: -0.005,
      textTransform: 'uppercase' as const,
    },
    bodyPrimary: {
      fontFamily: 'YTF Grand 123',
      fontSize: 8,
      lineHeight: 1.2,
      letterSpacing: 0.0025,
    },
    bodySecondary: {
      fontFamily: 'YTF Grand 123',
      fontSize: 8,
      lineHeight: 1.6,
      letterSpacing: 0.0025,
    },
    heading: {
      fontFamily: 'YTF Oldman',
      fontSize: 62,
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      textAlign: 'center' as const,
      letterSpacing: -0.6,
      lineHeight: 1.0,
      margin: 0,
      padding: 0,
    },
    sectionHeading: {
      fontFamily: 'YTF Oldman',
      fontSize: 40,
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      letterSpacing: -0.9,
      lineHeight: 1.0,
      margin: 0,
      padding: 0,
    },
    infoLabel: {
      fontFamily: 'YTF Vang Mono',
      fontSize: 5,
      lineHeight: 1,
      letterSpacing: -0.005,
      textTransform: 'uppercase' as const,
      opacity: 0.5,
      marginBottom: 2,
    },
    infoValue: {
      fontFamily: 'YTF Grand 123',
      fontSize: 11,
      lineHeight: 1.2,
    },
    tableCell: {
      fontFamily: 'YTF Grand 123',
      fontSize: 10,
      paddingVertical: 4,
      paddingHorizontal: 2,
      flexWrap: 'wrap' as const,
    },
    totalValue: {
      fontFamily: 'YTF Grand 123',
      fontSize: 10,
      textAlign: 'right' as const,
    },
    totalBig: {
      fontFamily: 'YTF Grand 123 Light',
      fontSize: 24,
      fontWeight: 'light' as const,
      textAlign: 'right' as const,
      letterSpacing: -0.0025,
    },
    notesLabel: {
      fontFamily: 'YTF Vang Mono',
      fontSize: 5,
      lineHeight: 1,
      letterSpacing: -0.005,
      textTransform: 'uppercase' as const,
      textAlign: 'center' as const,
      marginBottom: 0,
    },
    notesText: {
      fontFamily: 'YTF Grand 123',
      fontSize: 12,
      lineHeight: 1.6,
      letterSpacing: 0.0025,
      color: '#000000',
      textAlign: 'center' as const,
      maxWidth: '70%',
      alignSelf: 'center' as const,
    },
    label: {
      fontFamily: 'YTF Vang Mono',
      fontSize: 12,
      lineHeight: 1.4,
      letterSpacing: -0.01,
      color: '#000000',
      textTransform: 'uppercase' as const,
    },
  },
};

// Define heading style for Oldman title
const headingStyle = {
  fontFamily: "YTF Oldman",
  fontSize: 62,
  fontWeight: "bold",
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  letterSpacing: -0.6,
  lineHeight: 1.0,
  margin: 0,
  padding: 0,
};

const sectionHeadingStyle = {
  fontFamily: "YTF Oldman",
  fontSize: 40,
  fontWeight: "bold",
  textTransform: 'uppercase' as const,
  letterSpacing: -0.9, // 90% tracking
  lineHeight: 1.0,
  margin: 0,
  padding: 0,
};

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "YTF Grand 123",
    backgroundColor: COLORS.bgPrimary,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.horizontal,
    paddingTop: SPACING.vertical,
    paddingBottom: SPACING.vertical,
  },
  headerText: {
    ...textStyles.pdf.footnote,
  },
  title: {
    fontFamily: "YTF Oldman",
    fontSize: 62,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: COLORS.outlinePrimary,
    paddingVertical: SPACING.vertical,
    letterSpacing: -0.6,
    lineHeight: 1,
    margin: 0,
    padding: 0,
  },
  infoBlock: {
    flexDirection: "row",
    gap: SPACING.gap,
    paddingHorizontal: SPACING.horizontal,
    paddingVertical: SPACING.vertical,
    backgroundColor: COLORS.infoBlock,
    marginBottom: 0,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    ...textStyles.pdf.footnote,
    opacity: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: "YTF Grand 123",
    fontSize: 11,
    lineHeight: 1.2,
  },
  section: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    marginBottom: 0,
  },
  value: {
    width: "70%",
    fontSize: 12,
  },
  table: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.3,
    borderBottomColor: COLORS.outlinePrimary,
    paddingBottom: 4,
    marginBottom: 0,
    backgroundColor: COLORS.tableHeader,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 24,
    alignItems: "center",
    borderBottomWidth: 0.3,
    borderBottomColor: COLORS.outlinePrimary,
    marginBottom: 0,
  },
  tableCell: {
    fontSize: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
    flexWrap: "wrap",
    fontFamily: "YTF Grand 123",
  },
  totalSection: {
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: SPACING.horizontal,
    marginTop: SPACING.vertical,
    marginBottom: 0,
    padding: SPACING.vertical,
    borderRadius: SPACING.borderRadius,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  totalLabel: {
    ...textStyles.pdf.footnote,
  },
  totalValue: {
    fontFamily: "YTF Grand 123",
    fontSize: 10,
    textAlign: "right",
  },
  totalBig: {
    fontFamily: 'YTF Grand 123 Light',
    fontSize: 24,
    fontWeight: 'light' as const,
    textAlign: 'right' as const,
    letterSpacing: -0.0025,
  },
  notesSection: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 4,
    marginBottom: 0,
  },
  notesLabel: {
    ...textStyles.pdf.footnote,
    textAlign: 'center',
    marginBottom: 0,
  },
  notesText: {
    ...textStyles.pdf.bodySecondary,
    textAlign: 'center',
    maxWidth: '70%',
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 4,
    marginBottom: 0,
  },
  footerText: {
    ...textStyles.pdf.footnote,
  },
  footnote: textStyles.pdf.footnote,
  bodyPrimary: textStyles.pdf.bodyPrimary,
  bodySecondary: textStyles.pdf.bodySecondary,
  heading: textStyles.pdf.heading,
  sectionHeading: sectionHeadingStyle,
})

interface QuotationDocumentProps {
  data: QuotationData
}

// Reusable components
const LicenseInfo = ({ licensee, quotationDate, validityDate, billingAddress, businessSize }: {
  licensee: { name: string; companyName?: string; email: string; address?: string },
  quotationDate: string,
  validityDate: string,
  billingAddress?: string,
  businessSize?: { name: string; description: string }
}) => {
  // License display logic
  const businessSizeDisplayMap: Record<string, string> = {
    'Individual (1×)': 'Individual License (No Commercial Use)',
    'XS – Business (2×)': 'XS-Business License',
    'S – Business (3×)': 'S-Business License',
    'M – Business (5×)': 'M-Business License',
    'L – Business (8×)': 'L-Business License',
    'XL – Business (10×)': 'XL-Business License',
  };
  const displayLicense = businessSize?.name
    ? businessSizeDisplayMap[businessSize.name] || (businessSize.name.split(' ')[0] + ' License')
    : '';

  return (
    <View style={{ flexDirection: 'row', width: 595, height: 210, margin: '0 auto' }}>
      {/* License Provider Container */}
      <View style={{ width: 297.5, flexDirection: 'column' }}>
        {/* License Provider Info */}
        <View style={{ height: 64, padding: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', overflow: 'hidden', gap: 8 }}>
          <Text style={{ ...textStyles.pdf.footnote, color: COLORS.contentSecondary }}>LICENSE PROVIDER</Text>
          <Text style={textStyles.pdf.bodySecondary}>Yellow Type Foundry Company Ltd.{"\n"}No.6, Lane 36, Nguyen Hong Street{"\n"}Lang Ha Ward, Dong Da District, Hanoi, Vietnam{"\n"}Tax ID 0109884491</Text>
        </View>
        {/* Quotation Date Info */}
        <View style={{ height: 64, padding: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', overflow: 'hidden', gap: 8 }}>
          <Text style={{ ...textStyles.pdf.footnote, color: COLORS.contentSecondary }}>QUOTATION DATE</Text>
          <Text style={textStyles.pdf.bodySecondary}>{`${quotationDate}. ${validityDate}`}</Text>
        </View>
      </View>
      {/* Licensee Info Container */}
      <View style={{ width: 297.5, flexDirection: 'column' }}>
        {/* Licensee Info */}
        <View style={{ height: 64, padding: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', overflow: 'hidden', gap: 8 }}>
          <Text style={{ ...textStyles.pdf.footnote, color: COLORS.contentSecondary, textAlign: 'right' }}>LICENSEE / END USER</Text>
          <Text style={[textStyles.pdf.bodySecondary, { textAlign: 'right' }]}>
            {licensee.name || ""}
            {licensee.companyName ? "\n" + licensee.companyName : ""}
            {licensee.email ? "\n" + licensee.email : ""}
            {displayLicense ? "\n" + displayLicense : ""}
          </Text>
        </View>
        {/* Billing Address Info */}
        <View style={{ height: 64, padding: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', overflow: 'hidden', gap: 8 }}>
          <Text style={{ ...textStyles.pdf.footnote, color: COLORS.contentSecondary, textAlign: 'right' }}>BILLING ADDRESS</Text>
          <Text style={[textStyles.pdf.bodySecondary, { textAlign: 'right' }]}>{billingAddress || 'N/A'}</Text>
        </View>
      </View>
    </View>
  )
}

const SectionRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={textStyles.pdf.label}>{label}</Text>
    <Text style={textStyles.pdf.bodyPrimary}>{value}</Text>
  </View>
)

// Logo component for PDF
const LogoComponent = () => (
  <View style={{ height: 32, padding: 8, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width="29" height="16" viewBox="0 0 29 17">
      <Path d="M8.45437 11.6261H10.8617L9.33844 8.26746L7.96474 -0.203903H5.92459L6.97187 4.99041L3.39481 -0.203903H0.756226L6.91747 8.18587L8.45437 11.6261ZM11.8954 16.4261H14.3436V11.6261H17.0638V9.65442H14.3436V6.58134H17.2814V4.59608H11.8954V16.4261ZM21.6745 -0.203903L20.7497 1.79496H22.7898L18.2335 11.6261H20.7225L25.2924 1.79496H27.3325L28.2438 -0.203903H21.6745Z" fill="black" />
    </Svg>
  </View>
)

// PageTitle component
const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: -1, borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary, paddingBottom: 0 }}>
    <Text style={{ ...textStyles.pdf.heading, transform: 'translateY(-8px)' }}>{children}</Text>
  </View>
)

// PageInfoTop component
const PageInfoTop = ({ quotationNumber, formattedDate }: { quotationNumber: string; formattedDate: string }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: COLORS.outlinePrimary,
  }}>
    <Text style={[textStyles.pdf.footnote, { textTransform: 'uppercase', width: 150 }]}>Yellow Type Foundry</Text>
    <Text style={[textStyles.pdf.footnote, { textTransform: 'uppercase', flex: 1, textAlign: 'center' }]}>{`Quotation No. ${quotationNumber}`}</Text>
    <Text style={[textStyles.pdf.footnote, { textTransform: 'uppercase', width: 150, textAlign: 'right' }]}>{`Issued on ${formattedDate}`}</Text>
  </View>
)

// PageInfoBottom component
const PageInfoBottom = () => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: COLORS.outlinePrimary,
  }}>
    <Text style={[textStyles.pdf.footnote, { textTransform: 'uppercase', width: 150 }]}>©2025 YELLOW TYPE FOUNDRY</Text>
    <Text style={[textStyles.pdf.footnote, { textTransform: 'uppercase', flex: 1, textAlign: 'center' }]}>YELLOWTYPE.COM</Text>
    <Text style={[textStyles.pdf.footnote, { textTransform: 'uppercase', width: 150, textAlign: 'right' }]}>STRICTLY CONFIDENTIAL</Text>
  </View>
)

// QuotationTableHeader component
const QuotationTableHeader = () => (
  <View>
    <View style={{
      flexDirection: 'row',
      borderTopWidth: 0.3,
      borderBottomWidth: 0.3,
      borderColor: COLORS.outlinePrimary,
      marginBottom: 0,
      backgroundColor: COLORS.tableHeader,
    }}>
      <Text style={[textStyles.pdf.footnote, { width: '8%', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 8 }]}>No</Text>
      <Text style={[textStyles.pdf.footnote, { width: '30%', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 8 }]}>Typeface</Text>
      <Text style={[textStyles.pdf.footnote, { width: '25%', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 8 }]}>License Type</Text>
      <Text style={[textStyles.pdf.footnote, { width: '20%', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 8 }]}>Usage</Text>
      <Text style={[textStyles.pdf.footnote, { width: '17%', textAlign: 'right', textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 8 }]}>Amount</Text>
    </View>
  </View>
)

// Create lookup maps for license type and usage id to label
const licenseTypeLabelMap = Object.fromEntries(licenseTypes.map(lt => [lt.id, lt.name]))

// Create a comprehensive usage lookup map from all usage option categories
const usageLabelMap = Object.fromEntries([
  ...usageOptions.business.map(u => [u.id, u.name]),
  ...usageOptions.app.map(u => [u.id, u.name]),
  ...usageOptions.broadcast.map(u => [u.id, u.name]),
  ...usageOptions.packaging.map(u => [u.id, u.name]),
])

// QuotationRowContainer component
const QuotationRowContainer = ({ index, item }: { index: number, item: QuotationItem }) => {
  return (
    <View style={styles.tableRow}>
      <Text style={[textStyles.pdf.footnote, { width: '8%', paddingHorizontal: 8, paddingVertical: 8 }]}>{`0${index + 1}.`}</Text>
      <Text style={[textStyles.pdf.bodyPrimary, { width: '30%', paddingHorizontal: 8, paddingVertical: 8 }]}>{item.typeface}</Text>
      <Text style={[textStyles.pdf.bodyPrimary, { width: '25%', paddingHorizontal: 8, paddingVertical: 8 }]}>{licenseTypeLabelMap[item.licenseType] || item.licenseType}</Text>
      <Text style={[textStyles.pdf.bodyPrimary, { width: '20%', paddingHorizontal: 8, paddingVertical: 8 }]}>{usageLabelMap[item.usage] || item.usage}</Text>
      <Text style={[textStyles.pdf.bodyPrimary, { width: '17%', textAlign: 'right', paddingHorizontal: 8, paddingVertical: 8 }]}>${item.amount.toFixed(2)}</Text>
    </View>
  );
}

// TotalSummaryRow component
const TotalSummaryRow = ({ total }: { total: number }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  }}>
    <Text style={[textStyles.pdf.footnote, { flex: 1, paddingHorizontal: 8, paddingVertical: 4 }]}>SUBTOTAL</Text>
    <Text style={[textStyles.pdf.bodyPrimary, { flex: 1, textAlign: 'right', paddingHorizontal: 8, paddingVertical: 4 }]}>{`$${total.toFixed(2)}`}</Text>
  </View>
)

// DiscountRow component
const DiscountRow = ({ discount, percentage }: { discount: number; percentage: number }) => {
  if (discount <= 0) return null;
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 24,
    }}>
      <Text style={[textStyles.pdf.footnote, { flex: 1, paddingHorizontal: 8, paddingVertical: 4 }]}>{`Bundle Discount (${percentage}%)`}</Text>
      <Text style={[textStyles.pdf.bodyPrimary, { flex: 1, textAlign: 'right', paddingHorizontal: 8, paddingVertical: 4 }]}>{`–$${discount.toFixed(2)}`}</Text>
    </View>
  )
}

// TotalRow component
const TotalRow = ({ total }: { total: number }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 28, backgroundColor: COLORS.bgSecondary }}>
    <Text style={{
      flex: 1,
      fontFamily: 'YTF Grand 123 Light',
      fontWeight: 'light',
      fontSize: 20,
      lineHeight: 1,
      letterSpacing: -0.01,
      textAlign: 'left',
      paddingHorizontal: 8,
      paddingTop: 6,
      paddingBottom: 10,
    }}>Total (USD)</Text>
    <Text style={{
      flex: 1,
      fontFamily: 'YTF Grand 123 Light',
      fontWeight: 'light',
      fontSize: 20,
      lineHeight: 1,
      letterSpacing: -0.01,
      textAlign: 'right',
      paddingHorizontal: 8,
      paddingTop: 6,
      paddingBottom: 10,
    }}>{`$${total.toFixed(2)}`}</Text>
  </View>
)

export const QuotationDocument: React.FC<QuotationDocumentProps> = ({ data }) => {
  // Ensure we have valid data
  const safeData: QuotationData & { companyName?: string } = {
    quotationNumber: data?.quotationNumber || "",
    quotationDate: data?.quotationDate || "",
    clientName: data?.clientName || "",
    clientEmail: data?.clientEmail || "",
    clientAddress: data?.clientAddress || "",
    businessSize: data?.businessSize || { name: "", description: "" },
    items: Array.isArray(data?.items) ? data.items : [],
    subtotal: Number(data?.subtotal) || 0,
    discount: Number(data?.discount) || 0,
    total: Number(data?.total) || 0,
    companyName: data?.companyName || "",
  }

  // Format date
  const today = new Date(safeData.quotationDate)
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase()

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, flexDirection: 'column', flex: 1 }}>
        {/* Logo at the top */}
        <LogoComponent />
        {/* Header Row */}
        <PageInfoTop quotationNumber={safeData.quotationNumber} formattedDate={formattedDate} />
        {/* Title */}
        <PageTitle>
          <Text style={textStyles.pdf.heading}>Typeface Licensing Quotation</Text>
        </PageTitle>
        {/* Info Blocks */}
        <LicenseInfo
          licensee={{ name: safeData.clientName, companyName: safeData.companyName, email: safeData.clientEmail, address: safeData.clientAddress }}
          quotationDate={formattedDate}
          validityDate={`Valid until ${new Date(new Date(safeData.quotationDate).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          billingAddress={safeData.clientAddress}
          businessSize={safeData.businessSize}
        />
        {/* Table Section */}
        <View style={styles.table}>
          <QuotationTableHeader />
          {safeData.items.map((item, index) => {
            return <QuotationRowContainer key={index} index={index} item={item} />;
          })}
          <TotalSummaryRow total={safeData.subtotal} />
          {safeData.discount > 0 && (
            <DiscountRow 
              discount={safeData.discount} 
              percentage={Math.round((safeData.discount / safeData.subtotal) * 100)} 
            />
          )}
          <TotalRow total={safeData.total} />
        </View>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ ...styles.notesSection, borderTopWidth: 0, marginTop: 'auto' }}>
            <Text style={textStyles.pdf.footnote}>Notes</Text>
            <Text style={{
              ...textStyles.pdf.bodySecondary,
              textAlign: 'center',
              alignSelf: 'center',
              maxWidth: 340,
            }}>
              {`All offers and license agreements from Yellow Type Foundry are governed exclusively by Yellow Type Foundry's General Terms and Conditions (EULA), with any conflicting terms from the licensees' general conditions expressly excluded.`}
            </Text>
          </View>
        </View>
        <PageInfoBottom />
      </Page>
      {/* Duplicated page for Payment Instructions */}
      <Page size="A4" style={{ ...styles.page, flexDirection: 'column', flex: 1 }}>
        <LogoComponent />
        <PageInfoTop quotationNumber={safeData.quotationNumber} formattedDate={formattedDate} />
        {/* Title block for FOR PAYPAL */}
        <PageTitle>
          <Text style={textStyles.pdf.heading}>FOR PAYPAL</Text>
        </PageTitle>
        {/* 1st PaymentInfo: PayPal Address */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary, paddingTop: 6, paddingBottom: 8, paddingLeft: 80, paddingRight: 80 }}>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>PayPal Address</Text>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>hi@yellowtype.com</Text>
        </View>
        <PageTitle>
          <Text style={textStyles.pdf.heading}>FOR BANK TRANSFER</Text>
        </PageTitle>
        {/* 2nd PaymentInfo: Company Name */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary, paddingTop: 6, paddingBottom: 8, paddingLeft: 80, paddingRight: 80 }}>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>Company Name</Text>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>YELLOW TYPE FOUNDRY CO., LTD</Text>
        </View>
        {/* 3rd PaymentInfo: Address */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary, paddingTop: 6, paddingBottom: 8, paddingLeft: 80, paddingRight: 80 }}>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>Address</Text>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>No. 6, Lane 36 Nguyen Hong, Lang Ha Ward, Dong Da District, Hanoi City, Vietnam</Text>
        </View>
        {/* 4th & 5th PaymentInfo: Tax Identification No. and Bank Account No. (Grouped horizontally) */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary }}>
          {/* 4th PaymentInfo: Tax Identification No. */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 6, paddingBottom: 8, paddingLeft: 40, paddingRight: 20 }}>
            <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>Tax Identification No.</Text>
            <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>0109884491</Text>
          </View>
          {/* 5th PaymentInfo: Bank Account No. */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 6, paddingBottom: 8, paddingLeft: 20, paddingRight: 40, borderLeftWidth: 0.3, borderColor: COLORS.outlinePrimary }}>
            <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>Bank Account No.</Text>
            <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>1029 555 858</Text>
          </View>
        </View>
        {/* 6th PaymentInfo: Bank Name */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary, paddingTop: 6, paddingBottom: 8, paddingLeft: 80, paddingRight: 80 }}>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>Bank Name</Text>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>Vietcombank (Joint Stock Commercial Bank for Foreign Trade of Vietnam)</Text>
        </View>
        {/* 7th PaymentInfo: SWIFT CODE */}
        <View style={{ alignItems: 'center', justifyContent: 'center', borderBottomWidth: 0.3, borderColor: COLORS.outlinePrimary, paddingTop: 6, paddingBottom: 8, paddingLeft: 80, paddingRight: 80 }}>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center', color: COLORS.contentSecondary }}>SWIFT</Text>
          <Text style={{ fontFamily: 'YTF Grand 123 Light', fontSize: 18, fontWeight: 'light', lineHeight: 1.3, textAlign: 'center' }}>BFTVVNVX</Text>
        </View>
        {/* Notes block below the 7th PaymentInfo component */}
        <View style={{ ...styles.notesSection, borderTopWidth: 0 }}>
          <Text style={textStyles.pdf.footnote}>Notes</Text>
          <Text style={{
            ...textStyles.pdf.bodySecondary,
            textAlign: 'center',
            alignSelf: 'center',
            maxWidth: 340,
          }}>
            {`After completing the transfer, kindly send us the receipt as proof of payment. We will provide the download link for the font as well as your license once the payment is confirmed.`}
          </Text>
        </View>
        <PageInfoBottom />
      </Page>
    </Document>
  )
}
