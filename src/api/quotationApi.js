import API from "./axios";

// ==================== MATERIAL APIs ====================

/**
 * Search materials by name - returns from database
 * @param {string} query - Search term
 * @returns {Promise} - API response with materials from DB
 */
export const searchMaterials = async (query) => {
  try {
    const response = await API.get(`/quotation-materials/search?query=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error in searchMaterials:', error);
    throw error;
  }
};

/**
 * Get all materials from database
 * @returns {Promise} - API response with all materials
 */
export const getAllMaterials = async () => {
  try {
    const response = await API.get('/quotation-materials');
    return response;
  } catch (error) {
    console.error('Error in getAllMaterials:', error);
    throw error;
  }
};

/**
 * Create new material in database
 * @param {Object} materialData - Material data { name, unit, price, description, category }
 * @returns {Promise} - API response with saved material
 */
export const createQuotationMaterial = async (materialData) => {
  try {
    const response = await API.post('/quotation-materials', materialData);
    return response;
  } catch (error) {
    console.error('Error in createQuotationMaterial:', error);
    throw error;
  }
};

/**
 * Get material by ID from database
 * @param {string} id - Material ID
 * @returns {Promise} - API response
 */
export const getQuotationMaterialById = async (id) => {
  try {
    const response = await API.get(`/quotation-materials/${id}`);
    return response;
  } catch (error) {
    console.error('Error in getQuotationMaterialById:', error);
    throw error;
  }
};

/**
 * Update material in database
 * @param {string} id - Material ID
 * @param {Object} materialData - Updated material data
 * @returns {Promise} - API response
 */
export const updateQuotationMaterial = async (id, materialData) => {
  try {
    const response = await API.put(`/quotation-materials/${id}`, materialData);
    return response;
  } catch (error) {
    console.error('Error in updateQuotationMaterial:', error);
    throw error;
  }
};

/**
 * Delete material from database (soft delete)
 * @param {string} id - Material ID
 * @returns {Promise} - API response
 */
export const deleteQuotationMaterial = async (id) => {
  try {
    const response = await API.delete(`/quotation-materials/${id}`);
    return response;
  } catch (error) {
    console.error('Error in deleteQuotationMaterial:', error);
    throw error;
  }
};

/**
 * Get popular materials from database (most used)
 * @returns {Promise} - API response with popular materials
 */
export const getPopularMaterials = async () => {
  try {
    const response = await API.get('/quotation-materials/popular');
    return response;
  } catch (error) {
    console.error('Error in getPopularMaterials:', error);
    throw error;
  }
};

// ==================== QUOTATION APIs ====================

/**
 * Create new quotation with images
 * @param {FormData} formData - Form data with quotation details and images
 * @returns {Promise} - API response
 */
export const createQuotation = async (formData) => {
  try {
    const response = await API.post('/quotations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error in createQuotation:', error);
    throw error;
  }
};

/**
 * Get all quotations from database
 * @returns {Promise} - API response
 */
export const getAllQuotations = async () => {
  try {
    const response = await API.get('/quotations');
    return response;
  } catch (error) {
    console.error('Error in getAllQuotations:', error);
    throw error;
  }
};

/**
 * Get quotation by ID from database
 * @param {string} id - Quotation ID
 * @returns {Promise} - API response
 */
export const getQuotationById = async (id) => {
  try {
    const response = await API.get(`/quotations/${id}`);
    return response;
  } catch (error) {
    console.error('Error in getQuotationById:', error);
    throw error;
  }
};

/**
 * Update quotation in database
 * @param {string} id - Quotation ID
 * @param {FormData} formData - Updated form data
 * @returns {Promise} - API response
 */
export const updateQuotation = async (id, formData) => {
  try {
    const response = await API.put(`/quotations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  } catch (error) {
    console.error('Error in updateQuotation:', error);
    throw error;
  }
};

/**
 * Delete quotation from database
 * @param {string} id - Quotation ID
 * @returns {Promise} - API response
 */
export const deleteQuotation = async (id) => {
  try {
    const response = await API.delete(`/quotations/${id}`);
    return response;
  } catch (error) {
    console.error('Error in deleteQuotation:', error);
    throw error;
  }
};

/**
 * Update quotation status in database
 * @param {string} id - Quotation ID
 * @param {string} status - New status (draft, sent, accepted, rejected, expired)
 * @returns {Promise} - API response
 */
export const updateQuotationStatus = async (id, status) => {
  try {
    const response = await API.patch(`/quotations/${id}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error in updateQuotationStatus:', error);
    throw error;
  }
};

/**
 * Get quotations by customer from database
 * @param {string} customerId - Customer ID
 * @returns {Promise} - API response
 */
export const getQuotationsByCustomer = async (customerId) => {
  try {
    const response = await API.get(`/quotations/customer/${customerId}`);
    return response;
  } catch (error) {
    console.error('Error in getQuotationsByCustomer:', error);
    throw error;
  }
};

// ==================== PRINT APIS ====================

/**
 * Print quotation with costs (opens in new window with only print content)
 * @param {Object} quotationData - Quotation data to print
 * @param {Object} customerData - Customer data
 * @param {Array} items - Quotation items
 * @param {string} validUntil - Valid until date
 */
export const printQuotationWithCosts = (quotationData, customerData, items, validUntil) => {
  // Prepare print data
  const printData = {
    customer: customerData,
    items: items,
    validUntil: validUntil,
    quotationNumber: quotationData?.quotationNumber,
    showCost: true
  };
  
  // Store in localStorage
  localStorage.setItem('printQuotation', JSON.stringify(printData));
  
  // Open print window
  openPrintWindow();
};

/**
 * Print quotation without costs (opens in new window with only print content)
 * @param {Object} customerData - Customer data
 * @param {Array} items - Quotation items (without rates)
 * @param {string} validUntil - Valid until date
 */
export const printQuotationWithoutCosts = (customerData, items, validUntil) => {
  // Prepare items without cost data
  const itemsWithoutCost = items.map(item => ({
    title: item.title,
    notes: item.notes,
    materials: item.materials.map(m => ({
      name: m.name,
      qty: m.qty,
      unit: m.unit
      // Excluding rate and total
    }))
  }));

  // Prepare print data
  const printData = {
    customer: customerData,
    items: itemsWithoutCost,
    validUntil: validUntil,
    showCost: false
  };
  
  // Store in localStorage
  localStorage.setItem('printQuotation', JSON.stringify(printData));
  
  // Open print window
  openPrintWindow();
};

/**
 * Open print window with clean print view
 */
const openPrintWindow = () => {
  // Open a new window with minimal UI
  const printWindow = window.open('', '_blank', 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');
  
  if (!printWindow) {
    alert('Popup blocker detected! Please allow popups for this site.');
    return;
  }

  // Get print data from localStorage
  const printData = JSON.parse(localStorage.getItem('printQuotation') || '{}');

  // Generate HTML content
  const htmlContent = generatePrintHTML(printData);

  // Write to new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Focus and print after content loads
  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
  };
};

/**
 * Generate HTML for printing
 * @param {Object} data - Print data
 * @returns {string} - HTML string
 */
const generatePrintHTML = (data) => {
  const { customer, items, validUntil, quotationNumber, showCost } = data;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
    return `Rs ${Number(amount).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateGrandTotal = (items) => {
    return items.reduce((sum, item) => {
      return sum + item.materials.reduce((itemSum, mat) => {
        return itemSum + (mat.qty * (mat.rate || 0));
      }, 0);
    }, 0);
  };

  const grandTotal = showCost ? calculateGrandTotal(items) : 0;

  // Generate items HTML
  let itemsHTML = '';
  items.forEach((item, itemIndex) => {
    itemsHTML += `
      <tr class="print-item-title">
        <td>${itemIndex + 1}</td>
        <td colspan="${showCost ? '5' : '3'}">
          <strong>${item.title}</strong>
          ${item.notes ? `<span class="print-item-notes"> - ${item.notes}</span>` : ''}
        </td>
      </tr>
    `;

    item.materials.forEach((material) => {
      itemsHTML += `
        <tr class="print-material">
          <td></td>
          <td>• ${material.name}</td>
          <td>${material.qty}</td>
          <td>${material.unit}</td>
          ${showCost ? `
            <td>${formatCurrency(material.rate || 0)}</td>
            <td>${formatCurrency((material.qty || 0) * (material.rate || 0))}</td>
          ` : ''}
        </tr>
      `;
    });
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          background: white;
          padding: 20px;
          margin: 0;
        }
        
        .print-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        /* Hide everything except print content when printing */
        @media print {
          body {
            padding: 0;
          }
          .print-container {
            max-width: 100%;
          }
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        
        .print-header h1 {
          font-size: 28px;
          margin-bottom: 15px;
          color: #000;
        }
        
        .print-company h2 {
          font-size: 18px;
          margin: 5px 0;
          color: #333;
        }
        
        .print-company p {
          margin: 3px 0;
          font-size: 12px;
          color: #666;
        }
        
        .print-info {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 5px;
        }
        
        .print-info h3 {
          font-size: 16px;
          color: #333;
        }
        
        .print-info p {
          margin: 3px 0;
          font-size: 13px;
          color: #666;
        }
        
        .print-customer {
          margin: 20px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background: #fafafa;
        }
        
        .print-customer h3 {
          margin-bottom: 15px;
          font-size: 16px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
          color: #333;
        }
        
        .print-customer p {
          margin: 5px 0;
          font-size: 14px;
          color: #444;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 25px 0;
          font-size: 14px;
        }
        
        .print-table th {
          background: #333;
          color: white;
          padding: 12px 8px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
        }
        
        .print-table td {
          padding: 10px 8px;
          border: 1px solid #ddd;
        }
        
        .print-item-title {
          background: #f0f0f0;
          font-weight: bold;
        }
        
        .print-item-title td {
          background: #e8e8e8;
          border: 1px solid #ccc;
        }
        
        .print-item-notes {
          font-size: 11px;
          color: #666;
          font-style: italic;
          margin-left: 5px;
        }
        
        .print-material td {
          padding-left: 25px;
          background: white;
        }
        
        .print-total {
          font-weight: bold;
          background: #f0f0f0;
        }
        
        .print-total td {
          background: #e8e8e8;
          border: 1px solid #ccc;
          font-size: 15px;
        }
        
        .print-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        
        /* No other elements will be visible */
        body > *:not(.print-container) {
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <!-- Header -->
        <div class="print-header">
          <h1>QUOTATION</h1>
          <div class="print-company">
            <h2>Your Company Name</h2>
            <p>123 Business Avenue, City</p>
            <p>Phone: +92 123 4567890 | Email: info@company.com</p>
          </div>
        </div>

        <!-- Quotation Info -->
        <div class="print-info">
          <div class="print-left">
            <h3>Quotation #: ${quotationNumber || 'Q-' + Date.now().toString().slice(-6)}</h3>
          </div>
          <div class="print-right">
            <p><strong>Date:</strong> ${formatDate(new Date())}</p>
            <p><strong>Valid Until:</strong> ${formatDate(validUntil)}</p>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="print-customer">
          <h3>Bill To:</h3>
          <p><strong>${customer?.name || 'N/A'}</strong></p>
          <p>Phone: ${customer?.phone || 'N/A'}</p>
          ${customer?.address ? `<p>Address: ${customer.address}</p>` : ''}
        </div>

        <!-- Items Table -->
        <table class="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              ${showCost ? '<th>Rate (Rs)</th><th>Total (Rs)</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          ${showCost ? `
            <tfoot>
              <tr class="print-total">
                <td colspan="5" style="text-align: right;"><strong>Grand Total:</strong></td>
                <td><strong>${formatCurrency(grandTotal)}</strong></td>
              </tr>
            </tfoot>
          ` : ''}
        </table>

        <!-- Footer -->
        <div class="print-footer">
          <p>Thank you for your business!</p>
          <p>${new Date().getFullYear()} © Your Company Name. All rights reserved.</p>
        </div>
      </div>

      <script>
        // Auto-trigger print when page loads
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
};

/**
 * Print quotation by ID (fetches data from server)
 * @param {string} id - Quotation ID
 */
export const printQuotationById = async (id) => {
  try {
    const response = await getQuotationById(id);
    if (response.data?.success) {
      const quotation = response.data.data;
      
      // Prepare print data
      const printData = {
        customer: {
          name: quotation.customerName,
          phone: quotation.customerPhone,
          address: quotation.customerAddress
        },
        items: quotation.items,
        validUntil: quotation.validUntil,
        quotationNumber: quotation.quotationNumber,
        showCost: true
      };
      
      localStorage.setItem('printQuotation', JSON.stringify(printData));
      openPrintWindow();
    }
  } catch (error) {
    console.error('Error printing quotation by ID:', error);
    throw error;
  }
};

/**
 * Print quotation without costs by ID (fetches data from server)
 * @param {string} id - Quotation ID
 */
export const printQuotationWithoutCostsById = async (id) => {
  try {
    const response = await getQuotationById(id);
    if (response.data?.success) {
      const quotation = response.data.data;
      
      // Prepare items without costs
      const itemsWithoutCost = quotation.items.map(item => ({
        title: item.title,
        notes: item.notes,
        materials: item.materials.map(m => ({
          name: m.name,
          qty: m.quantity,
          unit: m.unit
        }))
      }));
      
      const printData = {
        customer: {
          name: quotation.customerName,
          phone: quotation.customerPhone,
          address: quotation.customerAddress
        },
        items: itemsWithoutCost,
        validUntil: quotation.validUntil,
        quotationNumber: quotation.quotationNumber,
        showCost: false
      };
      
      localStorage.setItem('printQuotation', JSON.stringify(printData));
      openPrintWindow();
    }
  } catch (error) {
    console.error('Error printing quotation without costs by ID:', error);
    throw error;
  }
};
// Update the getImageUrl function to properly handle URLs
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // Agar pehle se full URL hai
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Get base URL from API instance or environment
  const baseUrl = API.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Clean the URL - remove /api from base if it exists
  const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
  
  // Clean the image URL
  let cleanUrl = imageUrl;
  
  // Remove any /api prefix from the image URL
  if (cleanUrl.startsWith('/api/')) {
    cleanUrl = cleanUrl.substring(4);
  }
  
  // Ensure the URL starts with /uploads
  if (!cleanUrl.startsWith('/uploads')) {
    if (cleanUrl.includes('uploads')) {
      // If it contains uploads but doesn't start with it, extract the path
      const uploadsIndex = cleanUrl.indexOf('/uploads');
      if (uploadsIndex !== -1) {
        cleanUrl = cleanUrl.substring(uploadsIndex);
      } else {
        cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`;
      }
    } else {
      cleanUrl = `/uploads/${cleanUrl.replace(/^\/+/, '')}`;
    }
  }
  
  const fullUrl = `${cleanBaseUrl}${cleanUrl}`;
  console.log('🖼️ Generated image URL:', fullUrl);
  
  return fullUrl;
};

// ==================== EXPORT ALL FUNCTIONS ====================
export default {
  // Material APIs
  searchMaterials,
  getAllMaterials,
  createQuotationMaterial,
  getQuotationMaterialById,
  updateQuotationMaterial,
  deleteQuotationMaterial,
  getPopularMaterials,

  // Quotation APIs
  createQuotation,
  getAllQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  updateQuotationStatus,
  getQuotationsByCustomer,
  
  // Print APIs
  printQuotationWithCosts,
  printQuotationWithoutCosts,
  printQuotationById,
  printQuotationWithoutCostsById
};