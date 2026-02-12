import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#3c4257',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  invoiceTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#3c4257',
  },
  logoImage: {
    width: 70,
    height: 40,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metaBlock: {
    width: '30%',
  },
  metaLabel: {
    fontSize: 9,
    color: '#8792a2',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    color: '#3c4257',
    fontFamily: 'Helvetica-Bold',
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  addressBlock: {
    width: '45%',
  },
  addressLabel: {
    fontSize: 9,
    color: '#8792a2',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 10,
    color: '#3c4257',
    lineHeight: 1.5,
  },
  amountDueBanner: {
    backgroundColor: '#f5f3ff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountDueText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e8ee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    color: '#8792a2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  tableCell: {
    fontSize: 10,
    color: '#3c4257',
  },
  colDescription: { width: '40%' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnitPrice: { width: '20%', textAlign: 'right' },
  colTax: { width: '15%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right' },
  totalsSection: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 250,
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#8792a2',
    width: 150,
    textAlign: 'right',
    paddingRight: 16,
  },
  totalsValue: {
    fontSize: 10,
    color: '#3c4257',
    width: 100,
    textAlign: 'right',
  },
  totalsBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#3c4257',
  },
  totalsDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e3e8ee',
    marginVertical: 4,
    width: 250,
    alignSelf: 'flex-end',
  },
  amountDueRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 250,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#3c4257',
    marginTop: 4,
  },
  amountDueLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#3c4257',
    width: 150,
    textAlign: 'right',
    paddingRight: 16,
  },
  amountDueValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#3c4257',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e3e8ee',
    paddingTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#8792a2',
  },
})

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPriceExclTax: number // in pence
  taxAmount: number // in pence
  amountExclTax: number // in pence
}

export interface InvoiceData {
  invoiceNumber: string
  dateOfIssue: string
  dateDue: string
  customerName: string
  customerEmail: string
  lineItems: InvoiceLineItem[]
  subtotalExclTax: number // in pence
  vatAmount: number // in pence
  totalInclTax: number // in pence
}

function formatCurrency(pence: number): string {
  return `\u00A3${(pence / 100).toFixed(2)}`
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.invoiceTitle}>Invoice</Text>
          <Image style={styles.logoImage} src={`${process.env.NEXT_PUBLIC_APP_URL || ''}/logo.png`} />
        </View>

        {/* Invoice Meta */}
        <View style={styles.metaSection}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Invoice number</Text>
            <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date of issue</Text>
            <Text style={styles.metaValue}>{data.dateOfIssue}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date due</Text>
            <Text style={styles.metaValue}>{data.dateDue}</Text>
          </View>
        </View>

        {/* From / Bill To */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>From</Text>
            <Text style={[styles.addressText, styles.totalsBold]}>FilingHub</Text>
            <Text style={styles.addressText}>167-169 Great Portland Street</Text>
            <Text style={styles.addressText}>London, W1W 5PF</Text>
            <Text style={styles.addressText}>020 4621 7701</Text>
            <Text style={[styles.addressText, { marginTop: 4 }]}>VAT Number: 449753744</Text>
          </View>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Bill to</Text>
            <Text style={[styles.addressText, styles.totalsBold]}>{data.customerName}</Text>
            <Text style={styles.addressText}>{data.customerEmail}</Text>
          </View>
        </View>

        {/* Amount Due Banner */}
        <View style={styles.amountDueBanner}>
          <Text style={styles.amountDueText}>
            {formatCurrency(data.totalInclTax)} due {data.dateDue}
          </Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>Unit price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTax]}>Tax</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>
          {data.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colUnitPrice]}>{formatCurrency(item.unitPriceExclTax)}</Text>
              <Text style={[styles.tableCell, styles.colTax]}>{formatCurrency(item.taxAmount)}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(item.amountExclTax)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatCurrency(data.subtotalExclTax)}</Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total excluding tax</Text>
            <Text style={styles.totalsValue}>{formatCurrency(data.subtotalExclTax)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              VAT - United Kingdom (20% on {formatCurrency(data.subtotalExclTax)})
            </Text>
            <Text style={styles.totalsValue}>{formatCurrency(data.vatAmount)}</Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={styles.totalsRow}>
            <Text style={[styles.totalsLabel, styles.totalsBold]}>Total</Text>
            <Text style={[styles.totalsValue, styles.totalsBold]}>{formatCurrency(data.totalInclTax)}</Text>
          </View>
          <View style={styles.amountDueRow}>
            <Text style={styles.amountDueLabel}>Amount due</Text>
            <Text style={styles.amountDueValue}>{formatCurrency(data.totalInclTax)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={[styles.footerText, { fontFamily: 'Helvetica-Oblique' }]}>FilingHub is a trading name of Taxsol Ltd.</Text>
              <Text style={styles.footerText}>167-169 Great Portland Street, London, W1W 5PF</Text>
              <Text style={styles.footerText}>Contact: 020 4621 7701 | VAT Number: 449753744</Text>
            </View>
            <Text style={styles.footerText}>Page 1 of 1</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
