"use client"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "1px solid #EEEEEE",
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#F59E0B", // Yellow color
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#6B7280", // Gray color
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#F59E0B", // Yellow color
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  clientInfo: {
    marginBottom: 20,
  },
  clientName: {
    fontSize: 12,
    fontWeight: "bold",
  },
  clientDetail: {
    fontSize: 10,
    marginBottom: 3,
    color: "#6B7280", // Gray color
  },
  fontList: {
    marginTop: 10,
    marginBottom: 10,
  },
  fontItem: {
    fontSize: 10,
    marginBottom: 5,
    paddingLeft: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF", // Light gray
  },
  signature: {
    marginTop: 50,
    borderTop: "1px solid #EEEEEE",
    paddingTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLine: {
    borderTop: "1px solid #000000",
    marginTop: 40,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 8,
    color: "#6B7280", // Gray color
  },
})

// Create Document Component
export const EULADocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Yellow Type Foundry</Text>
        <Text style={styles.subtitle}>End User License Agreement</Text>
      </View>

      {/* Client Information */}
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{data.clientName}</Text>
        <Text style={styles.clientDetail}>{data.clientCompany}</Text>
        <Text style={styles.clientDetail}>{data.clientEmail}</Text>
        <Text style={styles.clientDetail}>{data.clientAddress}</Text>
        <Text style={styles.clientDetail}>License Date: {data.licenseDate}</Text>
      </View>

      {/* Project Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Information</Text>
        <Text style={styles.text}>Project Name: {data.projectName}</Text>
        {data.projectDescription && <Text style={styles.text}>Description: {data.projectDescription}</Text>}
        {data.usageScope && <Text style={styles.text}>Usage Scope: {data.usageScope}</Text>}
      </View>

      {/* Licensed Fonts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Licensed Fonts</Text>
        <View style={styles.fontList}>
          {data.selectedFonts.map((font, index) => (
            <Text key={index} style={styles.fontItem}>
              • {font.label}
            </Text>
          ))}
        </View>
      </View>

      {/* License Terms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>License Terms</Text>
        <Text style={styles.text}>
          This End User License Agreement (the "Agreement") is a legal agreement between you (the "Licensee") and Yellow
          Type Foundry (the "Foundry") for the use of the font software specified above (the "Font Software").
        </Text>
        <Text style={styles.text}>
          1. GRANT OF LICENSE. The Foundry grants you a non-exclusive, non-transferable license to use the Font Software
          for the purposes outlined in this agreement.
        </Text>
        <Text style={styles.text}>
          2. RESTRICTIONS. You may not modify, adapt, translate, reverse engineer, decompile, disassemble, or create
          derivative works based on the Font Software.
        </Text>
        <Text style={styles.text}>
          3. COPYRIGHT. The Font Software is protected by copyright laws and international copyright treaties, as well
          as other intellectual property laws and treaties.
        </Text>
        <Text style={styles.text}>
          4. TERMINATION. This license will terminate automatically if you fail to comply with the terms of this
          agreement.
        </Text>
        <Text style={styles.text}>
          5. LIMITATION OF LIABILITY. In no event shall the Foundry be liable for any damages arising out of the use or
          inability to use the Font Software.
        </Text>
      </View>

      {/* Signatures */}
      <View style={styles.signature}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Yellow Type Foundry</Text>
        </View>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>
            {data.clientName}, {data.clientCompany}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Yellow Type Foundry • www.yellowtypefoundry.com • contact@yellowtypefoundry.com</Text>
      </View>
    </Page>
  </Document>
)
