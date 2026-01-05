import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { Company } from '@/contexts/bulk-selection-context';
import { Service } from './service-selector';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #1e40af',
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyNumber: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    fontSize: 10,
    color: '#000',
  },
  servicesGrid: {
    marginTop: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e40af',
    marginRight: 8,
  },
  serviceText: {
    fontSize: 10,
    flex: 1,
  },
  servicePrice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  qrSection: {
    marginTop: 25,
  },
  qrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  qrItem: {
    alignItems: 'center',
    marginBottom: 15,
    width: '30%',
  },
  qrCode: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  qrLabel: {
    fontSize: 9,
    textAlign: 'center',
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
});

interface CompanyPDFDocumentProps {
  company: Company;
  services: Service[];
  qrCodes: string[]; // Base64 data URLs
}

const CompanyPDFDocument: React.FC<CompanyPDFDocumentProps> = ({
  company,
  services,
  qrCodes,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.company_name}</Text>
          <Text style={styles.companyNumber}>
            Company Number: {company.company_number}
          </Text>
        </View>

        {/* Company Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{company.company_status || 'Not available'}</Text>
          </View>

          {company.company_type && (
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{company.company_type}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Confirmation Statement Due:</Text>
            <Text style={styles.value}>
              {formatDate(company.confirmation_statement_due)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Accounts Due:</Text>
            <Text style={styles.value}>
              {formatDate(company.accounts_due)}
            </Text>
          </View>
        </View>

        {/* Selected Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceBullet} />
                <Text style={styles.serviceText}>{service.title}</Text>
                <Text style={styles.servicePrice}>{formatPrice(service.base_price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* QR Codes Section */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Scan QR Code to Pay for Service</Text>
          <View style={styles.qrGrid}>
            {qrCodes.map((qrCode, index) => (
              <View key={index} style={styles.qrItem}>
                <Image src={qrCode} style={styles.qrCode} />
                <Text style={styles.qrLabel}>{services[index]?.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString('en-GB')} | Scan QR codes to process payments
        </Text>
      </Page>
    </Document>
  );
};

export default CompanyPDFDocument;
