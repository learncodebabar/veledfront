import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  FiUser, FiPhone, FiSave, FiX, 
  FiCheckCircle, FiPackage, FiDollarSign,
  FiPlus, FiTrash2, FiDownload, FiUpload,
  FiSearch, FiAlertCircle, FiFolder, FiEdit2,
  FiPrinter, FiTrendingUp
} from "react-icons/fi";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { createQuotationCustomer } from "../../../api/quotationCustomerApi";

// Import quotation APIs
import { 
  createQuotation,
  getQuotationsByCustomer
} from "../../../api/quotationApi";

// ✅ IMPORT ADMIN MATERIAL APIs
import { searchMaterials as searchAdminMaterials } from "../../../api/adminMaterialApi";

// Import CSS
import "./AddQuotationCustomer.css";

const AddQuotationCustomer = () => {
  const navigate = useNavigate();
  
  // ========== CUSTOMER STATE ==========
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [customerSaved, setCustomerSaved] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // ========== IMAGES STATE ==========
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [imageDescriptions, setImageDescriptions] = useState([]);

  // ========== QUOTATION ITEMS STATE ==========
  const [quotationItems, setQuotationItems] = useState([]);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    id: Date.now(),
    title: "",
    notes: "",
    materials: []
  });

  // Current material being added
  const [currentMaterial, setCurrentMaterial] = useState({
    name: "",
    qty: 1,
    rate: 0,
    unit: "piece",
    total: 0
  });

  // Material search
  const [searchResults, setSearchResults] = useState([]);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);

  // ========== ESTIMATE STATE ==========
  const [estimate, setEstimate] = useState({
    low: "",
    medium: "",
    high: ""
  });

  // ========== EDIT MODE STATE ==========
  const [editingItemId, setEditingItemId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // ========== QUOTATION DETAILS ==========
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
  );

  // ========== UI STATES ==========
  const [loading, setLoading] = useState(false);
  const [savingQuotation, setSavingQuotation] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // ========== UNITS ==========
  const units = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "meter", label: "Meter" },
    { value: "feet", label: "Feet" },
    { value: "inch", label: "Inch" },
    { value: "liter", label: "Liter" },
    { value: "dozen", label: "Dozen" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" }
  ];

  // ========== EFFECTS ==========
  
  // ✅ MATERIAL SEARCH
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (currentMaterial.name.length > 1) {
        searchMaterialsFromAdmin(currentMaterial.name);
      } else {
        setSearchResults([]);
        setShowMaterialDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [currentMaterial.name]);

  // Calculate material total
  useEffect(() => {
    const total = (currentMaterial.qty || 0) * (currentMaterial.rate || 0);
    setCurrentMaterial(prev => ({ ...prev, total }));
  }, [currentMaterial.qty, currentMaterial.rate]);

  // ========== API FUNCTIONS ==========
  
  const searchMaterialsFromAdmin = async (query) => {
    try {
      const response = await searchAdminMaterials(query);
      if (response && response.success && response.data) {
        setSearchResults(response.data);
        setShowMaterialDropdown(true);
      }
    } catch (error) {
      console.error("Error searching admin materials:", error);
    }
  };

  // ========== HELPER FUNCTIONS ==========
  
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const closeToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  const validateCustomer = () => {
    const newErrors = {};
    if (!customer.name.trim()) newErrors.name = "Name is required";
    if (!customer.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{11}$/.test(customer.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Enter valid phone number (11 digits)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========== ENTER KEY HANDLER ==========
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Get the active element
      const activeElement = document.activeElement;
      
      // Handle different input contexts
      if (activeElement.id === 'material-name') {
        addMaterialToCurrentItem();
      } else if (activeElement.id === 'item-title') {
        if (currentItem.materials.length > 0) {
          saveCurrentItem();
        }
      } else if (activeElement.classList.contains('customer-input')) {
        if (!customerSaved) {
          saveCustomer();
        }
      }
    }
  };

  // Add event listener for Enter key
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentMaterial, currentItem, customerSaved]);

  // ========== CUSTOMER HANDLERS ==========
  
  const saveCustomer = async () => {
    if (!validateCustomer()) {
      showToast("Please fill required fields", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await createQuotationCustomer(customer);
      
      if (response.data && response.data.success) {
        const savedCustomer = response.data.data;
        setCustomerId(savedCustomer._id);
        setCustomerSaved(true);
        
        setCurrentItem({
          id: Date.now(),
          title: "",
          notes: "",
          materials: []
        });
        
        showToast("Customer saved successfully!", "success");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      showToast(error.response?.data?.message || "Failed to save customer", "error");
    } finally {
      setLoading(false);
    }
  };

  // ========== IMAGE HANDLING ==========
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      showToast("Maximum 5 images allowed", "error");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = [...imagePreview];
    const newDescriptions = [...imageDescriptions];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreview([...newPreviews]);
      };
      reader.readAsDataURL(file);
      newDescriptions.push("");
    });
    
    setImageDescriptions(newDescriptions);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreview];
    const newDescriptions = [...imageDescriptions];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    newDescriptions.splice(index, 1);
    
    setImages(newImages);
    setImagePreview(newPreviews);
    setImageDescriptions(newDescriptions);
  };

  const handleImageDescriptionChange = (index, value) => {
    const newDescriptions = [...imageDescriptions];
    newDescriptions[index] = value;
    setImageDescriptions(newDescriptions);
  };

  // ========== MATERIAL HANDLERS ==========
  
  const handleMaterialSelect = (material) => {
    setCurrentMaterial({
      ...currentMaterial,
      name: material.name,
      rate: material.price,
      unit: material.unit
    });
    setShowMaterialDropdown(false);
    setSearchResults([]);
    
    // Focus on quantity input after selection
    setTimeout(() => {
      const qtyInput = document.querySelector('.material-qty-input');
      if (qtyInput) qtyInput.focus();
    }, 100);
  };

  const addMaterialToCurrentItem = () => {
    if (!currentMaterial.name.trim()) {
      showToast("Please enter material name", "error");
      return;
    }
    if (currentMaterial.qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }
    if (currentMaterial.rate <= 0) {
      showToast("Rate must be greater than 0", "error");
      return;
    }

    const newMaterial = {
      id: Date.now() + Math.random(),
      name: currentMaterial.name,
      qty: currentMaterial.qty,
      rate: currentMaterial.rate,
      unit: currentMaterial.unit,
      total: currentMaterial.total
    };

    setCurrentItem({
      ...currentItem,
      materials: [...currentItem.materials, newMaterial]
    });

    setCurrentMaterial({
      name: "",
      qty: 1,
      rate: 0,
      unit: "piece",
      total: 0
    });
    
    showToast("Material added to item", "success");
    
    // Focus back on material name input
    setTimeout(() => {
      const materialInput = document.getElementById('material-name');
      if (materialInput) materialInput.focus();
    }, 100);
  };

  const removeMaterialFromCurrentItem = (materialId) => {
    setCurrentItem({
      ...currentItem,
      materials: currentItem.materials.filter(m => m.id !== materialId)
    });
  };

  // ========== ITEM HANDLERS ==========
  
  const saveCurrentItem = () => {
    if (!currentItem.title.trim()) {
      showToast("Please enter item title", "error");
      return;
    }
    if (currentItem.materials.length === 0) {
      showToast("Please add at least one material", "error");
      return;
    }

    const subtotal = currentItem.materials.reduce((sum, m) => sum + m.total, 0);
    
    const newItem = {
      id: currentItem.id,
      title: currentItem.title,
      notes: currentItem.notes,
      materials: [...currentItem.materials],
      subtotal: subtotal
    };

    if (isEditMode && editingItemId) {
      // Update existing item
      const updatedItems = quotationItems.map(item => 
        item.id === editingItemId ? newItem : item
      );
      setQuotationItems(updatedItems);
      setIsEditMode(false);
      setEditingItemId(null);
      showToast("Quotation item updated", "success");
    } else {
      // Add new item
      setQuotationItems([...quotationItems, newItem]);
      showToast("Quotation item saved", "success");
    }

    setCurrentItem({
      id: Date.now(),
      title: "",
      notes: "",
      materials: []
    });
  };

  // ✅ EDIT ITEM FUNCTION
  const editQuotationItem = (item) => {
    setCurrentItem({
      id: item.id,
      title: item.title,
      notes: item.notes,
      materials: [...item.materials]
    });
    setIsEditMode(true);
    setEditingItemId(item.id);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const removeQuotationItem = (itemId) => {
    setQuotationItems(quotationItems.filter(item => item.id !== itemId));
    showToast("Item removed", "success");
  };

  // ========== CALCULATIONS ==========
  
  const calculateGrandTotal = () => {
    return quotationItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
    return `Rs ${Number(amount).toFixed(2)}`;
  };

  // ========== PRINT FUNCTIONS ==========
  
  const handlePrintWithoutCost = () => {
    if (!customerSaved || quotationItems.length === 0) {
      showToast("Please complete quotation first", "error");
      return;
    }
    
    // Store quotation data in localStorage for print page
    const printData = {
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      },
      items: quotationItems.map(item => ({
        title: item.title,
        notes: item.notes,
        materials: item.materials.map(m => ({
          name: m.name,
          qty: m.qty,
          unit: m.unit
          // Excluding rate and total for without cost
        }))
      })),
      validUntil,
      showCost: false
    };
    
    localStorage.setItem('printQuotation', JSON.stringify(printData));
    window.open('/print-quotation', '_blank');
  };

  const handlePrintWithCost = () => {
    if (!customerSaved || quotationItems.length === 0) {
      showToast("Please complete quotation first", "error");
      return;
    }
    
    // Store quotation data in localStorage for print page
    const printData = {
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address
      },
      items: quotationItems,
      grandTotal: calculateGrandTotal(),
      validUntil,
      showCost: true
    };
    
    localStorage.setItem('printQuotation', JSON.stringify(printData));
    window.open('/print-quotation', '_blank');
  };

  // ========== SAVE QUOTATION ==========
  const saveCompleteQuotation = async () => {
    if (!customerSaved || !customerId) {
      showToast("Please save customer first", "error");
      return;
    }

    if (quotationItems.length === 0) {
      showToast("Add at least one quotation item", "error");
      return;
    }

    try {
      setSavingQuotation(true);

      // ✅ FIXED: Ensure all numbers are valid
      const processedItems = quotationItems.map(item => {
        // Calculate item subtotal from materials
        const itemSubtotal = item.materials.reduce((sum, mat) => {
          const qty = parseFloat(mat.qty) || 0;
          const rate = parseFloat(mat.rate) || 0;
          return sum + (qty * rate);
        }, 0);

        return {
          title: item.title || 'Quotation Item',
          notes: item.notes || '',
          materials: item.materials.map(mat => ({
            materialName: mat.name || '',
            quantity: parseFloat(mat.qty) || 0,
            unit: mat.unit || 'piece',
            pricePerUnit: parseFloat(mat.rate) || 0,
            totalPrice: (parseFloat(mat.qty) || 0) * (parseFloat(mat.rate) || 0)
          })),
          subtotal: itemSubtotal
        };
      });

      const quotationData = {
        customer: customerId,
        items: processedItems,
        validUntil: validUntil,
        estimate: estimate // Add estimate data
      };

      console.log("📤 Sending quotation data:", JSON.stringify(quotationData, null, 2));

      // Create FormData for images
      const formData = new FormData();
      formData.append('customer', quotationData.customer);
      formData.append('items', JSON.stringify(quotationData.items));
      formData.append('validUntil', quotationData.validUntil);
      formData.append('estimate', JSON.stringify(estimate));
      
      // Append images
      images.forEach((image, index) => {
        formData.append('images', image);
        if (imageDescriptions[index]) {
          formData.append(`imageDescription_${index}`, imageDescriptions[index]);
        }
      });

      const response = await createQuotation(formData);
      
      if (response.data && response.data.success) {
        showToast("Quotation created successfully!", "success");
        
        // Reset form
        setQuotationItems([]);
        setImages([]);
        setImagePreview([]);
        setImageDescriptions([]);
        setCustomerSaved(false);
        setCustomer({
          name: "",
          phone: "",
          address: ""
        });
        setEstimate({ low: "", medium: "", high: "" });
        
        setTimeout(() => {
          navigate("/all-Quotation");
        }, 2000);
      }

    } catch (error) {
      console.error("❌ Error saving quotation:", error);
      showToast(error.message || "Failed to save quotation", "error");
    } finally {
      setSavingQuotation(false);
    }
  };

  // ========== CANCEL EDIT ==========
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingItemId(null);
    setCurrentItem({
      id: Date.now(),
      title: "",
      notes: "",
      materials: []
    });
  };

  return (
    <div className="add-quotation-page" onKeyDown={handleKeyPress}>
      <Sidebar />
      
      <div className="add-quotation-content">
        {/* Toast Message */}
        {toast.show && (
          <div className={`add-quotation-toast add-quotation-toast-${toast.type}`}>
            <div className="add-quotation-toast-content">
              <span className="add-quotation-toast-text">{toast.message}</span>
            </div>
            <button className="add-quotation-toast-close" onClick={closeToast}>×</button>
          </div>
        )}

        <div className="add-quotation-card">
          {/* Header with Print Buttons */}
          <div className="add-quotation-header">
            <h1>Create New Quotation</h1>
            {customerSaved && quotationItems.length > 0 && (
              <div className="add-quotation-print-buttons">
                <button
                  type="button"
                  onClick={handlePrintWithoutCost}
                  className="add-quotation-btn add-quotation-btn-outline"
                  title="Print Without Cost"
                >
                  <FiPrinter /> Print (Without Cost)
                </button>
                <button
                  type="button"
                  onClick={handlePrintWithCost}
                  className="add-quotation-btn add-quotation-btn-primary"
                  title="Print With Cost"
                >
                  <FiPrinter /> Print (With Cost)
                </button>
              </div>
            )}
          </div>

          {/* Customer Section */}
          <div className="add-quotation-section">
            <h2 className="add-quotation-section-title">
              <FiUser className="add-quotation-section-icon" />
              Customer Information
            </h2>
            
            <div className="add-quotation-customer-form">
              {/* First Row - Name and Phone */}
              <div className="add-quotation-row">
                <div className="add-quotation-form-group add-quotation-half">
                  <label className="add-quotation-label">
                    Customer Name <span className="add-quotation-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`add-quotation-input customer-input ${customerSaved ? 'add-quotation-input-disabled' : ''}`}
                    placeholder="Enter customer name"
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    disabled={customerSaved}
                  />
                  {errors.name && <span className="add-quotation-error-text">{errors.name}</span>}
                </div>

                <div className="add-quotation-form-group add-quotation-half">
                  <label className="add-quotation-label">
                    Phone Number <span className="add-quotation-required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`add-quotation-input customer-input ${customerSaved ? 'add-quotation-input-disabled' : ''}`}
                    placeholder="03XX-XXXXXXX"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    disabled={customerSaved}
                  />
                  {errors.phone && <span className="add-quotation-error-text">{errors.phone}</span>}
                </div>
              </div>

              {/* Second Row - Address */}
              <div className="add-quotation-row">
                <div className="add-quotation-form-group add-quotation-full">
                  <label className="add-quotation-label">Address (Optional)</label>
                  <input
                    type="text"
                    className={`add-quotation-input customer-input ${customerSaved ? 'add-quotation-input-disabled' : ''}`}
                    placeholder="Enter complete address"
                    value={customer.address}
                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                    disabled={customerSaved}
                  />
                </div>
              </div>
            </div>

            {!customerSaved && (
              <button
                type="button"
                onClick={saveCustomer}
                className="add-quotation-btn add-quotation-btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Customer"}
              </button>
            )}

            {customerSaved && (
              <div className="add-quotation-saved-badge">
                <FiCheckCircle /> Customer Saved
              </div>
            )}
          </div>

          {/* Images Upload Section */}
          <div className={`add-quotation-section ${!customerSaved ? 'add-quotation-section-disabled' : ''}`}>
            <h2 className="add-quotation-section-title">
              <FiUpload className="add-quotation-section-icon" />
              Reference Images
            </h2>
            
            {customerSaved ? (
              <div className="add-quotation-image-upload">
                <label className="add-quotation-upload-label">
                  <FiUpload className="add-quotation-upload-icon" />
                  <span>Click to upload images (Max 5)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                <div className="add-quotation-image-previews">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="add-quotation-image-preview">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <input
                        type="text"
                        className="add-quotation-image-description"
                        placeholder="Image description (optional)"
                        value={imageDescriptions[index] || ''}
                        onChange={(e) => handleImageDescriptionChange(index, e.target.value)}
                      />
                      <button 
                        onClick={() => handleRemoveImage(index)}
                        className="add-quotation-image-remove"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="add-quotation-section-placeholder">
                <p>Please save customer information first</p>
              </div>
            )}
          </div>

          {/* Quotation Items Section */}
          <div className={`add-quotation-section ${!customerSaved ? 'add-quotation-section-disabled' : ''}`}>
            <h2 className="add-quotation-section-title">
              <FiFolder className="add-quotation-section-icon" />
              Quotation Items
            </h2>

            {customerSaved ? (
              <>
                {/* Current Item Form */}
                <div className="add-quotation-current-item">
                  <div className="add-quotation-form-grid">
                    <div className="add-quotation-form-group">
                      <label className="add-quotation-label">Item Title</label>
                      <input
                        type="text"
                        id="item-title"
                        className="add-quotation-input"
                        placeholder="e.g., Fabrication Work"
                        value={currentItem.title}
                        onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
                      />
                    </div>
                    <div className="add-quotation-form-group">
                      <label className="add-quotation-label">Item Notes</label>
                      <input
                        type="text"
                        className="add-quotation-input"
                        placeholder="Notes for this item"
                        value={currentItem.notes}
                        onChange={(e) => setCurrentItem({...currentItem, notes: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Materials for Current Item */}
                  <div className="add-quotation-materials">
                    <h4 className="add-quotation-subtitle">Add Materials to this Item</h4>
                    
                    {/* Material Input with Search Dropdown */}
                    <div className="add-quotation-material-row">
                      <div className="add-quotation-form-group add-quotation-material-field">
                        <input
                          type="text"
                          id="material-name"
                          className="add-quotation-input"
                          placeholder="Type material name to search..."
                          value={currentMaterial.name}
                          onChange={(e) => setCurrentMaterial({...currentMaterial, name: e.target.value})}
                        />
                        
                        {showMaterialDropdown && searchResults.length > 0 && (
                          <div className="add-quotation-material-dropdown">
                            {searchResults.map(material => (
                              <div
                                key={material._id}
                                className="add-quotation-material-option"
                                onClick={() => handleMaterialSelect(material)}
                              >
                                <span className="add-quotation-material-name">{material.name}</span>
                                <span className="add-quotation-material-price">
                                  {formatCurrency(material.price)}/{material.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="add-quotation-form-group add-quotation-form-group-small">
                        <input
                          type="number"
                          className="add-quotation-input material-qty-input"
                          placeholder="Qty"
                          value={currentMaterial.qty}
                          onChange={(e) => setCurrentMaterial({...currentMaterial, qty: parseFloat(e.target.value) || 0})}
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div className="add-quotation-form-group add-quotation-form-group-small">
                        <input
                          type="number"
                          className="add-quotation-input"
                          placeholder="Rate"
                          value={currentMaterial.rate}
                          onChange={(e) => setCurrentMaterial({...currentMaterial, rate: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className="add-quotation-form-group add-quotation-form-group-small">
                        <select
                          className="add-quotation-select"
                          value={currentMaterial.unit}
                          onChange={(e) => setCurrentMaterial({...currentMaterial, unit: e.target.value})}
                        >
                          {units.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={addMaterialToCurrentItem}
                        className="add-quotation-btn add-quotation-btn-add"
                      >
                        <FiPlus /> Add
                      </button>
                    </div>

                    {/* Current Item's Materials List */}
                    {currentItem.materials.length > 0 && (
                      <div className="add-quotation-current-materials">
                        <h5 className="add-quotation-materials-title">
                          Materials for "{currentItem.title || 'this item'}"
                        </h5>
                        {currentItem.materials.map((material) => (
                          <div key={material.id} className="add-quotation-material-item">
                            <div className="add-quotation-material-details">
                              <span className="add-quotation-material-name">{material.name}</span>
                              <span className="add-quotation-material-calculation">
                                {material.qty} × {formatCurrency(material.rate)} = {formatCurrency(material.total)}
                              </span>
                            </div>
                            <button
                              onClick={() => removeMaterialFromCurrentItem(material.id)}
                              className="add-quotation-btn-icon add-quotation-btn-remove"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                        
                        <div className="add-quotation-current-subtotal">
                          Item Subtotal: {formatCurrency(currentItem.materials.reduce((sum, m) => sum + m.total, 0))}
                        </div>
                      </div>
                    )}

                    {/* Save Item Button and Cancel Edit */}
                    <div className="add-quotation-item-actions">
                      {currentItem.materials.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={saveCurrentItem}
                            className="add-quotation-btn add-quotation-btn-save-item"
                          >
                            <FiSave /> {isEditMode ? "Update Item" : "Save Item"}
                          </button>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="add-quotation-btn add-quotation-btn-cancel"
                            >
                              <FiX /> Cancel
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Saved Quotation Items List */}
                {quotationItems.length > 0 && (
                  <div className="add-quotation-saved-items">
                    <h3 className="add-quotation-saved-title">Saved Quotation Items</h3>
                    {quotationItems.map((item) => (
                      <div key={item.id} className="add-quotation-saved-item">
                        <div className="add-quotation-saved-header">
                          <div>
                            <h4 className="add-quotation-saved-item-title">{item.title}</h4>
                            {item.notes && <p className="add-quotation-saved-notes">{item.notes}</p>}
                          </div>
                          <div className="add-quotation-item-controls">
                            <button
                              onClick={() => editQuotationItem(item)}
                              className="add-quotation-btn-icon add-quotation-btn-edit"
                              title="Edit Item"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => removeQuotationItem(item.id)}
                              className="add-quotation-btn-icon add-quotation-btn-remove"
                              title="Delete Item"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>

                        <div className="add-quotation-saved-materials">
                          {item.materials.map((material) => (
                            <div key={material.id} className="add-quotation-saved-material">
                              <div className="add-quotation-material-info">
                                <span className="add-quotation-material-name">{material.name}</span>
                                <span className="add-quotation-material-calculation">
                                  {material.qty} × {formatCurrency(material.rate)} = {formatCurrency(material.total)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="add-quotation-item-total">
                          Item Total: {formatCurrency(item.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="add-quotation-section-placeholder">
                <p>Please save customer information first</p>
              </div>
            )}
          </div>

          {/* Estimate Section - NEW */}
          <div className={`add-quotation-section ${!customerSaved ? 'add-quotation-section-disabled' : ''}`}>
            <h2 className="add-quotation-section-title">
              <FiTrendingUp className="add-quotation-section-icon" />
              Project Estimate
            </h2>
            
            {customerSaved ? (
              <div className="add-quotation-estimate-grid">
                <div className="add-quotation-estimate-group">
                  <label className="add-quotation-label">Low Estimate (Rs)</label>
                  <input
                    type="number"
                    className="add-quotation-input"
                    placeholder="Enter low estimate"
                    value={estimate.low}
                    onChange={(e) => setEstimate({...estimate, low: e.target.value})}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="add-quotation-estimate-group">
                  <label className="add-quotation-label">Medium Estimate (Rs)</label>
                  <input
                    type="number"
                    className="add-quotation-input"
                    placeholder="Enter medium estimate"
                    value={estimate.medium}
                    onChange={(e) => setEstimate({...estimate, medium: e.target.value})}
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="add-quotation-estimate-group">
                  <label className="add-quotation-label">High Estimate (Rs)</label>
                  <input
                    type="number"
                    className="add-quotation-input"
                    placeholder="Enter high estimate"
                    value={estimate.high}
                    onChange={(e) => setEstimate({...estimate, high: e.target.value})}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            ) : (
              <div className="add-quotation-section-placeholder">
                <p>Please save customer information first</p>
              </div>
            )}
          </div>

          {/* Valid Until Section */}
          <div className={`add-quotation-section ${!customerSaved ? 'add-quotation-section-disabled' : ''}`}>
            <h2 className="add-quotation-section-title">
              <FiDollarSign className="add-quotation-section-icon" />
              Quotation Validity
            </h2>
            
            {customerSaved ? (
              <div className="add-quotation-form-grid">
                <div className="add-quotation-form-group">
                  <label className="add-quotation-label">Valid Until</label>
                  <input
                    type="date"
                    className="add-quotation-input"
                    value={validUntil}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setValidUntil(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="add-quotation-section-placeholder">
                <p>Please save customer information first</p>
              </div>
            )}
          </div>

          {/* Grand Total Card */}
          {quotationItems.length > 0 && (
            <div className="add-quotation-grand-total">
              <div className="add-quotation-grand-total-content">
                <span className="add-quotation-grand-total-label">Grand Total</span>
                <span className="add-quotation-grand-total-amount">{formatCurrency(calculateGrandTotal())}</span>
              </div>
            </div>
          )}

          {/* Save Bill Button */}
          {customerSaved && quotationItems.length > 0 && (
            <button
              type="button"
              onClick={saveCompleteQuotation}
              className="add-quotation-btn add-quotation-btn-save-bill"
              disabled={savingQuotation}
            >
              {savingQuotation ? "Saving Quotation..." : "Save Complete Quotation"}
            </button>
          )}

          {/* Customer not saved warning */}
          {!customerSaved && (
            <div className="add-quotation-warning">
              ⚠️ Please save customer information first
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddQuotationCustomer;