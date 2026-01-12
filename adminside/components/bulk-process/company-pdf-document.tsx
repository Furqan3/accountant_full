import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { Company } from '@/contexts/bulk-selection-context';
import { Service } from './service-selector';

// Define styles for PDF matching FilingHub format
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Header with logo
  header: {
    marginBottom: 25,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 80,
    height: 60,
    marginRight: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  tagline: {
    fontSize: 10,
    color: '#333',
    marginBottom: 20,
  },
  // Private & Confidential section
  confidential: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  // Subject section
  subject: {
    fontSize: 10,
    marginBottom: 15,
    color: '#000',
  },
  subjectLabel: {
    fontWeight: 'bold',
  },
  // Body text
  bodyText: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 12,
    color: '#000',
    textAlign: 'justify',
  },
  // Company details section
  companyDetailsSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    border: '1 solid #e5e7eb',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  companyDetail: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  // QR Code section
  actionText: {
    fontSize: 10,
    marginTop: 15,
    marginBottom: 15,
    color: '#000',
  },
  qrTable: {
    flexDirection: 'row',
    border: '1 solid #000',
    marginBottom: 20,
  },
  qrColumn: {
    flex: 1,
    borderRight: '1 solid #000',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrColumnLast: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeLabel: {
    fontSize: 9,
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  qrOptionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#000',
  },
  qrOptionDesc: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333',
    lineHeight: 1.4,
  },
  // Website text
  websiteText: {
    fontSize: 10,
    marginBottom: 25,
    color: '#000',
  },
  websiteLink: {
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  // Footer disclaimer
  disclaimer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    textAlign: 'justify',
    lineHeight: 1.3,
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

  // Get website URL from environment or use default
  const websiteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/^https?:\/\//, '') || 'www.filinghub.co.uk';

  // Determine subject line based on services or company status
  const getSubjectLine = () => {
    if (services.some(s => s.title.toLowerCase().includes('confirmation statement'))) {
      return 'Confirmation Statement – Filing Due Soon';
    } else if (services.some(s => s.title.toLowerCase().includes('accounts'))) {
      return 'Annual Accounts – Filing Due Soon';
    } else {
      return 'Company Filing Services Available';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              src="/logo.png"
              style={styles.logo}
            />
          </View>
          <Text style={styles.tagline}>Online company filing & compliance services</Text>
        </View>

        {/* Private & Confidential */}
        <Text style={styles.confidential}>Private & Confidential</Text>

        {/* Subject Line */}
        <Text style={styles.subject}>
          <Text style={styles.subjectLabel}>Subject: </Text>
          {getSubjectLine()}
        </Text>

        {/* Body Text - First Paragraph */}
        <Text style={styles.bodyText}>
          This notice is to remind you that the annual confirmation statement for your company is approaching its statutory filing deadline with Companies House.
        </Text>

        {/* Company Details Box */}
        <View style={styles.companyDetailsSection}>
          <Text style={styles.companyName}>{company.company_name}</Text>
          <Text style={styles.companyDetail}>Company Number: {company.company_number}</Text>
          <Text style={styles.companyDetail}>Status: {company.company_status || 'Active'}</Text>
          {company.confirmation_statement_due && (
            <Text style={styles.companyDetail}>
              Confirmation Statement Due: {formatDate(company.confirmation_statement_due)}
            </Text>
          )}
          {company.accounts_due && (
            <Text style={styles.companyDetail}>
              Accounts Due: {formatDate(company.accounts_due)}
            </Text>
          )}
        </View>

        {/* Body Text - Second Paragraph */}
        <Text style={styles.bodyText}>
          All UK companies, including dormant and non-trading entities, must confirm their registered details annually. Late or missed filings may result in penalties or enforcement action.
        </Text>

        {/* Body Text - Third Paragraph */}
        <Text style={styles.bodyText}>
          If you have already filed directly with Companies House or instructed an accountant to do so, please disregard this letter. Public records may take up to two working days to update.
        </Text>

        {/* Action Text */}
        <Text style={styles.actionText}>
          To take action now, please choose one of the options below:
        </Text>

        {/* QR Codes Table */}
        <View style={styles.qrTable}>
          {services.slice(0, 3).map((service, index) => {
            const isLast = index === services.slice(0, 3).length - 1;
            return (
              <View key={index} style={isLast ? styles.qrColumnLast : styles.qrColumn}>
                <Text style={styles.qrCodeLabel}>QR CODE</Text>
                <Text style={styles.qrCodeLabel}>(Option {String.fromCharCode(65 + index)})</Text>

                {qrCodes[index] && (
                  <Image src={qrCodes[index]} style={styles.qrCode} />
                )}

                <Text style={styles.qrOptionTitle}>Option {String.fromCharCode(65 + index)}</Text>
                <Text style={styles.qrOptionDesc}>{service.title}</Text>
                <Text style={styles.qrOptionDesc}>{formatPrice(service.base_price)}</Text>
              </View>
            );
          })}
        </View>

        {/* Website Text */}
        <Text style={styles.websiteText}>
          You may also proceed directly by visiting{' '}
          <Text style={styles.websiteLink}>{websiteUrl}</Text>.
        </Text>

        {/* Footer Disclaimer */}
        <Text style={styles.disclaimer}>
          FilingHub Ltd is an independent software provider offering electronic company filing services. We are not affiliated with Companies House or HMRC.
        </Text>
      </Page>
    </Document>
  );
};

export default CompanyPDFDocument;
