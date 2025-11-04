/**
 * Label generation utilities using jsPDF and qrcode
 */

import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate QR code as data URL
 */
async function getQRCodeDataURL(value, size = 120) {
  try {
    const dataURL = await QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return dataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    // Return placeholder
    return null;
  }
}

/**
 * Generate a single label as PDF
 */
export async function generateSingleLabel({ sku, name, location, supplier, qrValue, settings = {} }) {
  const {
    paperSize = 'a4',
    includeLogo = true,
    includeSupplier = true,
    border = true,
    fontSize = 10,
  } = settings;

  const pdf = new jsPDF('p', 'mm', paperSize);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Label dimensions (centered on page)
  const labelWidth = 90;
  const labelHeight = 50;
  const x = (pageWidth - labelWidth) / 2;
  const y = (pageHeight - labelHeight) / 2;

  // Border
  if (border) {
    pdf.setDrawColor(100, 100, 100);
    pdf.rect(x, y, labelWidth, labelHeight);
  }

  // QR Code (left side)
  if (qrValue) {
    const qrDataURL = await getQRCodeDataURL(qrValue, 100);
    if (qrDataURL) {
      pdf.addImage(qrDataURL, 'PNG', x + 5, y + 5, 20, 20);
    }
  }

  // Logo (top right)
  if (includeLogo) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CoreStock', x + labelWidth - 30, y + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.text('by Blockwork-IT', x + labelWidth - 30, y + 12);
  }

  // Text content (right side of QR)
  let textY = y + 15;
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', 'bold');
  if (sku) {
    pdf.text(`SKU: ${sku}`, x + 30, textY);
    textY += 6;
  }
  pdf.setFont('helvetica', 'normal');
  if (name) {
    pdf.setFontSize(fontSize - 1);
    const nameLines = pdf.splitTextToSize(name, labelWidth - 35);
    pdf.text(nameLines, x + 30, textY);
    textY += nameLines.length * 4;
  }
  if (location) {
    pdf.setFontSize(8);
    pdf.text(`📍 ${location}`, x + 30, textY);
    textY += 5;
  }
  if (includeSupplier && supplier) {
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    const supplierLines = pdf.splitTextToSize(supplier, labelWidth - 35);
    pdf.text(supplierLines, x + 30, textY);
    pdf.setTextColor(0, 0, 0);
  }

  return pdf;
}

/**
 * Generate a label sheet (multiple labels on A4)
 */
export async function generateLabelSheet(items, settings = {}) {
  const {
    columns = 3,
    rows = 7,
    includeLogo = true,
    includeSupplier = true,
    border = true,
    fontSize = 9,
  } = settings;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - (margin * 2);
  const usableHeight = pageHeight - (margin * 2);
  const labelWidth = usableWidth / columns;
  const labelHeight = usableHeight / rows;

  let itemIndex = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (itemIndex >= items.length) break;

      const item = items[itemIndex];
      const x = margin + (col * labelWidth);
      const y = margin + (row * labelHeight);

      // Border
      if (border) {
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, y, labelWidth - 2, labelHeight - 2);
      }

      // QR Code (left side) - generate actual QR code
      const qrSize = Math.min(labelHeight * 0.4, labelWidth * 0.4, 25);
      const qrValue = item.qrValue || `PART:${item.sku}`;
      const qrDataURL = await getQRCodeDataURL(qrValue, Math.round(qrSize * 3)); // Higher res for better quality
      if (qrDataURL) {
        pdf.addImage(qrDataURL, 'PNG', x + 2, y + 2, qrSize, qrSize);
      }

      // Logo (top right)
      if (includeLogo) {
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CoreStock', x + labelWidth - 25, y + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5);
        pdf.text('by Blockwork-IT', x + labelWidth - 25, y + 8);
      }

      // Text content (right side of QR)
      let textY = y + 6;
      const textX = x + qrSize + 5;

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', 'bold');
      if (item.sku) {
        pdf.text(`SKU: ${item.sku}`, textX, textY, { maxWidth: labelWidth - qrSize - 10 });
        textY += 5;
      }

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(fontSize - 1);
      if (item.name) {
        const nameLines = pdf.splitTextToSize(item.name, labelWidth - qrSize - 10);
        pdf.text(nameLines, textX, textY);
        textY += nameLines.length * 4;
      }

      if (item.location) {
        pdf.setFontSize(7);
        pdf.text(`📍 ${item.location}`, textX, textY);
        textY += 4;
      }

      if (includeSupplier && item.supplier) {
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        const supplierLines = pdf.splitTextToSize(item.supplier, labelWidth - qrSize - 10);
        pdf.text(supplierLines, textX, textY);
        pdf.setTextColor(0, 0, 0);
      }

      itemIndex++;
    }
    if (itemIndex >= items.length) break;
  }

  return pdf;
}

/**
 * Re-generate a label sheet from stored export data
 */
export async function regenerateLabelSheet(exportData, items) {
  // This function would re-generate a PDF from stored export metadata
  // For now, just generate with the provided items
  return generateLabelSheet(items, exportData.settings || {});
}

