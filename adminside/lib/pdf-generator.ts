import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import CompanyPDFDocument from '@/components/bulk-process/company-pdf-document';
import { Company } from '@/contexts/bulk-selection-context';
import { Service } from '@/components/bulk-process/service-selector';

export async function generateCompanyPDF(
  company: Company,
  services: Service[]
): Promise<Blob> {
  try {
    // Get frontend URL from environment variable
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

    // Generate QR codes for each service
    const qrCodes = await Promise.all(
      services.map(async (service) => {
        const url = `${frontendUrl}/pay?company=${company.id}&service=${service.id}`;

        try {
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 200,
            margin: 2,
            color: {
              dark: '#1e40af', // Primary blue color
              light: '#ffffff',
            },
          });
          return qrDataUrl;
        } catch (error) {
          console.error(`Failed to generate QR code for service ${service.title}:`, error);
          // Return a placeholder or empty QR code
          return await QRCode.toDataURL('Error generating QR code', { width: 200 });
        }
      })
    );

    // Render PDF document
    const doc = CompanyPDFDocument({
      company,
      services,
      qrCodes,
    });

    // Convert to blob
    const blob = await pdf(doc).toBlob();

    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF for ${company.company_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
