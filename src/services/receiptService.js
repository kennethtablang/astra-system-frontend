// src/services/receiptService.js
import api from '../api/axios';

const receiptService = {
  // Generate thermal receipt for mobile printer (58mm)
  async generateMobileThermalReceipt(orderId) {
    try {
      const { data } = await api.get(`/receipt/thermal/${orderId}/mobile`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Generate thermal receipt for desktop printer (80mm)
  async generateDesktopThermalReceipt(orderId) {
    try {
      const { data } = await api.get(`/receipt/thermal/${orderId}/desktop`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Download thermal receipt as binary file
  async downloadThermalReceipt(orderId, paperWidth = 58) {
    try {
      const { data } = await api.get(`/receipt/thermal/${orderId}/download`, {
        params: { paperWidth },
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Preview thermal receipt as text
  async previewThermalReceipt(orderId, paperWidth = 58) {
    try {
      const { data } = await api.get(`/receipt/thermal/${orderId}/preview`, {
        params: { paperWidth }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Batch generate receipts for multiple orders
  async generateBatchReceipts(orderIds, paperWidth = 58) {
    try {
      const { data } = await api.post('/receipt/thermal/batch', orderIds, {
        params: { paperWidth }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Test printer connection
  async generateTestReceipt(paperWidth = 58) {
    try {
      const { data } = await api.get('/receipt/thermal/test', {
        params: { paperWidth }
      });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Helper: Download receipt file
  downloadReceiptFile(orderId, blob) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `receipt_${orderId}_${Date.now()}.bin`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Helper: Print receipt via browser
  printReceiptInBrowser(receiptText, orderId) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Order #${orderId}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                width: 58mm;
                margin: 0;
                padding: 10px;
              }
              @media print {
                body { margin: 0; padding: 5px; }
              }
              pre {
                margin: 0;
                white-space: pre-wrap;
              }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
};

export default receiptService;