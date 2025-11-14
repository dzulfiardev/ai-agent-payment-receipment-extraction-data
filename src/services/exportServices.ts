import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { parseNumber, parseInteger } from '../common/helpers';

interface ReceiptData {
  storeName?: string;
  date?: string;
  total?: number | string;
  tax?: number | string;
  totalDiscount?: number | string;
  currency?: string;
  address?: string;
  phone?: string;
  items?: Array<{
    name: string;
    price: number | string;
    quantity: number | string;
    unitPrice?: number | string;
  }>;
  totalItems?: number;
  fileName?: string;
}

export const exportToExcel = (data: ReceiptData) => {
  if (!data) return;

  // Create receipt summary sheet
  const summaryData = [
    ['Receipt Information', ''],
    ['Store Name', data.storeName || 'N/A'],
    ['Date', data.date ? new Date(data.date).toLocaleDateString() : 'N/A'],
    ['Address', data.address || 'N/A'],
    ['Phone', data.phone || 'N/A'],
    ['Currency', data.currency || 'USD'],
    ['', ''],
    ['Financial Summary', ''],
    ['Total Items', data.totalItems || data.items?.length || 0],
    ['Total Discount', data.totalDiscount || 'N/A'],
    ['Tax', data.tax || 'N/A'],
    ['Total Amount', data.total || 'N/A'],
  ];

  // Create items sheet
  const itemsData = [
    ['Item Name', 'Quantity', 'Unit Price', 'Total Price']
  ];

  if (data.items && data.items.length > 0) {
    data.items.forEach(item => {
      itemsData.push([
        item.name || 'N/A',
        parseInteger(item.quantity) || 0,
        parseInteger(item.unitPrice) || 0,
        parseInteger(item.price) || 0
      ]);
    });
  }
  console.log('Items Data:', itemsData);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Receipt Summary');

  // Add items sheet
  const itemsWs = XLSX.utils.aoa_to_sheet(itemsData);
  itemsWs['!cols'] = [
    { width: 40 },
    { width: 12 },
    { width: 15 },
    { width: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, itemsWs, 'Items');

  // Generate file name
  const fileName = `receipt_${data.storeName || 'unknown'}_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fileName);
};

export const exportToCSV = (data: ReceiptData, type: 'summary' | 'items' = 'items') => {
  if (!data) return;

  let csvData: any[] = [];
  let fileName = '';

  if (type === 'summary') {
    csvData = [
      {
        'Store Name': data.storeName || 'N/A',
        'Date': data.date ? new Date(data.date).toLocaleDateString() : 'N/A',
        'Address': data.address || 'N/A',
        'Phone': data.phone || 'N/A',
        'Currency': data.currency || 'USD',
        'Total Items': data.totalItems || data.items?.length || 0,
        'Total Discount': data.totalDiscount || 'N/A',
        'Tax': data.tax || 'N/A',
        'Total Amount': data.total || 'N/A'
      }
    ];
    fileName = `receipt_summary_${data.storeName || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
  } else {
    csvData = data.items?.map(item => ({
      'Item Name': item.name || 'N/A',
      'Quantity': item.quantity || 0,
      'Unit Price': item.unitPrice || 'N/A',
      'Total Price': item.price || 'N/A'
    })) || [];
    fileName = `receipt_items_${data.storeName || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
  }

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, fileName);
};

// Export both summary and items as separate CSV files
export const exportToCSVComplete = (data: ReceiptData) => {
  exportToCSV(data, 'summary');
  exportToCSV(data, 'items');
};