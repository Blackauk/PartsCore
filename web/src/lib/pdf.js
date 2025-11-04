/**
 * Export a printable region to PDF
 * @param {string} elementId - ID of the element to export
 * @param {string} filename - Output filename
 * @returns {Promise<Blob>} - PDF blob
 */
export async function exportToPdf(elementId, filename) {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Printable area ${elementId} not found`);

  // Dynamically import html2pdf.js
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: [5, 5, 5, 5],       // mm: top, left, bottom, right (tighter for labels)
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  // Make a clone with print-friendly classes
  el.classList.add('print-mode');
  
  try {
    // Generate blob first (for auto-attach)
    const blob = await html2pdf().set(opt).from(el).outputPdf('blob');
    
    // Then trigger download
    await html2pdf().set(opt).from(el).save();
    
    return blob;
  } finally {
    // Clean up
    el.classList.remove('print-mode');
  }
}

/**
 * Export PO to PDF with auto-attach
 * @param {string} poId - PO ID
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function exportPOToPdf(poId) {
  const now = new Date();
  const ts = now.toISOString().slice(0, 10);
  const filename = `PO-${poId}-${ts}.pdf`;
  
  const blob = await exportToPdf('po-print-area', filename);
  
  return { blob, filename };
}

