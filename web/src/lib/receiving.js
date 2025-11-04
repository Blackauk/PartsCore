// Helper utilities for receiving/goods receiving note (GRN) workflow

/**
 * Calculate remaining quantity to receive for a PO line
 * @param {Object} line - PO line with { qty, qtyReceived }
 * @returns {number} Remaining quantity
 */
export function calcRemaining(line) {
  const ordered = line.qty || 0;
  const received = line.qtyReceived || 0;
  return Math.max(0, ordered - received);
}

/**
 * Validate a receiving line
 * @param {Object} line - Receiving line data
 * @param {Object} options - Validation options
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateLine(line, options = {}) {
  const errors = [];
  const {
    allowOverReceipt = false,
    requireSerials = false,
    requireBatch = false,
    requireLocation = false,
  } = options;

  const remaining = calcRemaining(line);
  const qtyReceived = Number(line.qtyReceived || 0);
  const qtyRejected = Number(line.qtyRejected || 0);

  // Quantity validation
  if (qtyReceived < 0) {
    errors.push('Qty Received cannot be negative');
  }
  if (!allowOverReceipt && qtyReceived > remaining) {
    errors.push(`Qty Received (${qtyReceived}) exceeds remaining (${remaining})`);
  }
  if (allowOverReceipt && qtyReceived > remaining && !line.overReceiptReason) {
    errors.push('Over-receipt reason required');
  }

  // Serial validation
  if (requireSerials && qtyReceived > 0) {
    const serials = line.serials || [];
    if (serials.length !== qtyReceived) {
      errors.push(`Serial numbers required: ${qtyReceived} needed, ${serials.length} provided`);
    }
  }

  // Batch validation
  if (requireBatch && qtyReceived > 0 && !line.batchNo) {
    errors.push('Batch/Lot number required for batch-managed items');
  }

  // Rejection validation
  if (qtyRejected > 0 && !line.rejectionReason) {
    errors.push('Rejection reason required');
  }

  // Location validation
  if (requireLocation && qtyReceived > 0 && !line.location?.site) {
    errors.push('Location required for location-managed stock');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build inventory transactions from GRN lines
 * @param {Object} grn - GRN data
 * @param {Object} options - Transaction options
 * @returns {Array} Array of transaction objects
 */
export function buildTransactions(grn, options = {}) {
  const {
    postImmediately = true,
    transactionDate = new Date().toISOString().split('T')[0],
  } = options;

  if (!postImmediately) {
    return [];
  }

  const transactions = [];

  grn.lines.forEach((line) => {
    const qtyReceived = Number(line.qtyReceived || 0);
    const qtyRejected = Number(line.qtyRejected || 0);

    // BOOK_IN transaction for received items
    if (qtyReceived > 0) {
      transactions.push({
        type: 'BOOK_IN',
        grnId: grn.id,
        poId: grn.poId,
        partNo: line.partNo || line.sku,
        description: line.description || line.name,
        quantity: qtyReceived,
        location: line.location,
        serials: line.serials || [],
        batchNo: line.batchNo,
        expiryDate: line.expiryDate,
        date: transactionDate,
        receivedBy: grn.receivedBy,
        reference: `GRN ${grn.id}`,
      });
    }

    // Optional: Adjustment/Return transaction for rejected items
    if (qtyRejected > 0) {
      transactions.push({
        type: 'REJECTED',
        grnId: grn.id,
        poId: grn.poId,
        partNo: line.partNo || line.sku,
        description: line.description || line.name,
        quantity: -qtyRejected,
        reason: line.rejectionReason,
        date: transactionDate,
        receivedBy: grn.receivedBy,
        reference: `GRN ${grn.id} - Rejected`,
      });
    }
  });

  return transactions;
}

/**
 * Generate next GRN ID
 * @param {number} baseYear - Base year for ID (e.g., 2025 -> 20xx)
 * @returns {string} GRN ID like "GRN-2001"
 */
export function generateGrnId(baseYear = new Date().getFullYear()) {
  const year = baseYear % 100;
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `GRN-${year}${random.toString().slice(1)}`;
}

/**
 * Update PO line balances after GRN submission
 * @param {Object} po - Purchase order
 * @param {Object} grn - GRN with received lines
 * @returns {Object} Updated PO
 */
export function updatePoBalances(po, grn) {
  const updatedLines = po.lines.map((line) => {
    const grnLine = grn.lines.find(
      (gl) => (gl.partNo === line.partNo || gl.sku === line.sku)
    );
    if (!grnLine) return line;

    const currentReceived = line.qtyReceived || 0;
    const newReceived = Number(grnLine.qtyReceived || 0);
    const totalReceived = currentReceived + newReceived;

    return {
      ...line,
      qtyReceived: totalReceived,
      qtyRemaining: Math.max(0, line.qty - totalReceived),
      lastReceivedDate: grn.date,
    };
  });

  // Determine PO status
  const allReceived = updatedLines.every((l) => (l.qtyReceived || 0) >= l.qty);
  const anyReceived = updatedLines.some((l) => (l.qtyReceived || 0) > 0);
  const status = allReceived
    ? 'Closed'
    : anyReceived
    ? 'Partial'
    : po.status;

  return {
    ...po,
    lines: updatedLines,
    status,
  };
}

/**
 * Validate all lines in a GRN
 * @param {Object} grn - GRN data
 * @returns {Object} { valid: boolean, errors: Array<{lineIndex: number, errors: string[]}> }
 */
export function validateGrn(grn) {
  const errors = [];
  
  grn.lines.forEach((line, index) => {
    const validation = validateLine(line, {
      allowOverReceipt: grn.allowOverReceipt,
      requireSerials: line.requiresSerials,
      requireBatch: line.requiresBatch,
      requireLocation: line.requiresLocation,
    });

    if (!validation.valid) {
      errors.push({
        lineIndex: index,
        errors: validation.errors,
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}




