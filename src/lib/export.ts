import type { Receipt, ReceiptLine, ReceiptWithLines } from './schemas';

export function exportToCSV(data: unknown[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0] as object);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

export function exportReceiptsToCSV(receipts: Receipt[]) {
  const data = receipts.map((r) => ({
    id: r.id,
    vendor: r.vendor,
    date: r.dateTime,
    receiptNo: r.receiptNo || '',
    total: r.total,
    paid: r.paid || '',
    change: r.change || '',
    status: r.status,
    confidence: r.confidenceOverall,
  }));

  exportToCSV(data, `receipts_${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportReceiptLinesToCSV(lines: ReceiptLine[], receiptId?: string) {
  const data = lines.map((l) => ({
    index: l.index,
    description: l.descriptionRaw,
    qty: l.qty,
    unitPrice: l.unitPrice,
    lineTotal: l.lineTotal,
    unit: l.unit || '',
  }));

  const filename = receiptId
    ? `receipt_${receiptId}_lines.csv`
    : `receipt_lines_${new Date().toISOString().split('T')[0]}.csv`;

  exportToCSV(data, filename);
}

export function exportToJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

export function exportReceiptsToJSON(receipts: ReceiptWithLines[]) {
  exportToJSON(receipts, `receipts_${new Date().toISOString().split('T')[0]}.json`);
}

export function exportReceiptToJSON(receipt: ReceiptWithLines) {
  exportToJSON(receipt, `receipt_${receipt.id}.json`);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
