import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import CompanyPDFDocument from '@/components/bulk-process/company-pdf-document';
import { Service } from '@/components/bulk-process/service-selector';

interface CompanyData {
  id: string;
  company_number: string;
  company_name: string;
  company_status?: string;
  company_type?: string;
  date_of_creation?: string;
  confirmation_statement_due?: string;
  accounts_due?: string;
  registered_office_address?: any;
  sic_codes?: string[];
}

interface ServiceData {
  title: string;
  description?: string;
  price: number;
}

export async function generateSingleServicePDF(
  company: CompanyData,
  service: ServiceData
): Promise<void> {
  try {
    // Get frontend URL from environment variable
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

    // Create a service object matching the Service type
    const serviceForPDF: Service = {
      id: `service-${Date.now()}`,
      title: service.title,
      slug: service.title.toLowerCase().replace(/\s+/g, '-'),
      description: service.description || '',
      base_price: service.price,
      is_active: true,
      category: 'filing',
      features: {},
      metadata: {}
    };

    // Generate QR code for the service
    const url = `${frontendUrl}/pay?company=${company.id}&service=${serviceForPDF.id}`;

    let qrDataUrl: string;
    try {
      qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af', // Primary blue color
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error(`Failed to generate QR code for service ${service.title}:`, error);
      // Return a placeholder or empty QR code
      qrDataUrl = await QRCode.toDataURL('Error generating QR code', { width: 200 });
    }

    // Render PDF document - map company data to expected format
    const companyForPDF: any = {
      id: company.id,
      company_number: company.company_number,
      company_name: company.company_name,
      company_status: company.company_status || 'Active',
      company_type: company.company_type,
      confirmation_statement_due: company.confirmation_statement_due,
      accounts_due: company.accounts_due,
    };

    // Add optional fields if they exist
    if (company.date_of_creation) {
      companyForPDF.date_of_creation = company.date_of_creation;
    }
    if (company.registered_office_address) {
      companyForPDF.registered_office_address = company.registered_office_address;
    }
    if (company.sic_codes) {
      companyForPDF.sic_codes = company.sic_codes;
    }

    const doc = CompanyPDFDocument({
      company: companyForPDF,
      services: [serviceForPDF],
      qrCodes: [qrDataUrl],
    });

    // Convert to blob
    const blob = await pdf(doc as any).toBlob();

    // Create download link
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Generate filename: CompanyName_ServiceName.pdf
    const sanitizeFilename = (name: string) => {
      return name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    };

    const filename = `${sanitizeFilename(company.company_name)}_${sanitizeFilename(service.title)}.pdf`;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    console.log(`✅ PDF downloaded: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF for ${company.company_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
