import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generateCompanyPDF } from './pdf-generator';
import { Company } from '@/contexts/bulk-selection-context';
import { Service } from '@/components/bulk-process/service-selector';

export async function generateBulkPDFZip(
  companies: Company[],
  services: Service[]
): Promise<void> {
  if (companies.length === 0) {
    throw new Error('No companies selected');
  }

  if (services.length === 0) {
    throw new Error('No services selected');
  }

  try {
    const zip = new JSZip();

    // Generate PDFs in parallel
    const pdfPromises = companies.map(async (company) => {
      try {
        const pdfBlob = await generateCompanyPDF(company, services);

        // Create safe filename: company_number-company_name.pdf
        const safeName = company.company_name
          .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric with underscore
          .replace(/_+/g, '_') // Replace multiple underscores with single
          .substring(0, 50); // Limit length

        const fileName = `${company.company_number}-${safeName}.pdf`;

        return { fileName, pdfBlob };
      } catch (error) {
        console.error(`Failed to generate PDF for ${company.company_name}:`, error);
        // Re-throw to be caught by outer catch
        throw error;
      }
    });

    // Wait for all PDFs to be generated
    const pdfs = await Promise.all(pdfPromises);

    // Add all PDFs to ZIP
    pdfs.forEach(({ fileName, pdfBlob }) => {
      zip.file(fileName, pdfBlob);
    });

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // Balance between speed and compression
      },
    });

    // Generate filename with current date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const zipFileName = `bulk-services-${today}.zip`;

    // Trigger download
    saveAs(zipBlob, zipFileName);

  } catch (error) {
    console.error('Error generating bulk PDFs:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to generate PDF ZIP file'
    );
  }
}
