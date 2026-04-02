import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiDownload, FiArrowLeft, FiAlertCircle, FiImage, FiX, FiEdit2, FiPercent, FiDollarSign } from 'react-icons/fi';
import { getQuotationById } from '../../../api/quotationApi';
import { getProfile } from '../../../api/profileApi';



/* ─────────────────────────────────────────────────────────────
   ALL STYLES  — no external CSS file needed
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Open Sans', Arial, sans-serif; background: #f0f2f5; color: #333; }

  /* ── Action Bar ── */
  .pq-action-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 28px; background: #fff;
    border-bottom: 1px solid #dde3ec;
    position: sticky; top: 0; z-index: 200;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }
  .pq-action-bar .action-group { display: flex; gap: 10px; }

  /* ── Buttons ── */
  .pq-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border: none; border-radius: 5px;
    cursor: pointer; font-size: 13px; font-weight: 600;
    font-family: 'Open Sans', Arial, sans-serif;
    transition: filter 0.15s, transform 0.15s;
  }
  .pq-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .pq-btn--gray  { background: #607d8b; color: #fff; }
  .pq-btn--blue  { background: #1565C0; color: #fff; }
  .pq-btn--green { background: #2e7d32; color: #fff; }
  .pq-btn--orange { background: #ff9800; color: #fff; }
  .pq-btn--purple { background: #9c27b0; color: #fff; }

  /* ── Logo Modal ── */
  .logo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .logo-modal {
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .logo-modal h3 {
    margin-bottom: 20px;
    color: #333;
  }
  .logo-url-input, .brand-name-input, .signature-name-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 15px;
  }
  .logo-preview {
    margin: 15px 0;
    text-align: center;
  }
  .logo-preview img {
    max-height: 80px;
    max-width: 200px;
    object-fit: contain;
  }
  .modal-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  /* ── Page wrapper ── */
  .pq-page-wrap {
    background: #f0f2f5; min-height: 100vh;
    padding: 30px 20px; display: flex; justify-content: center;
  }

  /* ── White "paper" ── */
  .pq-paper {
    background: #fff; width: 100%; max-width: 870px;
    padding: 38px 44px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    border-radius: 4px;
    font-family: 'Open Sans', Arial, sans-serif; font-size: 13px;
  }

  /* ── Header ── */
  .pq-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 26px; padding-bottom: 18px;
    border-bottom: 2px solid #1565C0;
    position: relative;
  }
  .pq-logo-box { 
    display: flex; 
    flex-direction: column;
    align-items: center;
    gap: 8px;
    max-width: 220px;
    position: relative;
  }
  .logo-image-container {
    position: relative;
    cursor: pointer;
  }
  .company-logo-img {
    max-height: 60px;
    max-width: 180px;
    object-fit: contain;
    display: block;
  }
  .brand-name-text {
    font-size: 14px;
    font-weight: 700;
    color: #1a237e;
    text-align: center;
    letter-spacing: 0.5px;
    margin-top: 5px;
  }
  .edit-logo-btn {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1565C0;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .pq-logo-icon  {
    width: 44px; height: 44px; background: #1565C0; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px; font-weight: 700; flex-shrink: 0;
    cursor: pointer;
    margin-bottom: 5px;
  }
  .pq-logo-name  { font-size: 14px; font-weight: 700; color: #1a237e; text-align: center; letter-spacing: 0.5px; line-height: 1.2; }
  .pq-logo-sub   { font-size: 9px; color: #1565C0; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; margin-top: 2px; text-align: center; }
  .pq-quote-title {
    font-size: 26px; font-weight: 700; color: #1565C0;
    letter-spacing: 1.5px; text-transform: uppercase;
    text-align: right; margin-bottom: 10px;
  }
  .pq-meta-table { font-size: 12px; }
  .pq-meta-table td { padding: 2px 0; vertical-align: top; }
  .pq-meta-table .meta-label { color: #888; padding-right: 14px; white-space: nowrap; }
  .pq-meta-table .meta-val   { font-weight: 600; color: #1565C0; text-align: right; }

  /* ── Sender / Receiver ── */
  .pq-address-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 20px; margin-bottom: 22px;
  }
  .pq-section-label {
    background: #1565C0; color: #fff;
    font-size: 11px; font-weight: 700;
    padding: 6px 12px; letter-spacing: 1.2px; text-transform: uppercase;
  }
  .pq-address-box {
    border: 1px solid #d0d7e3; border-top: none;
    font-size: 12px; line-height: 1.8;
    padding: 8px 12px 10px;
  }
  .pq-address-box .addr-name { font-weight: 700; color: #1a237e; }
  .pq-address-box p { color: #444; }

  /* ── Images Section ── */
  .images-section {
    margin: 20px 0;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }
  .images-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    font-weight: 600;
    color: #1a237e;
  }
  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  .image-item {
    border: 1px solid #ddd;
    border-radius: 6px;
    overflow: hidden;
    background: white;
  }
  .image-item img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }
  .image-description {
    padding: 6px;
    font-size: 10px;
    color: #666;
    text-align: center;
    background: #f5f5f5;
    word-break: break-word;
  }

  /* ── Items table ── */
  .pq-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 22px; }
  .pq-table thead tr th {
    background: #1565C0; color: #fff; font-weight: 700;
    font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase;
    padding: 10px 10px; border: 1px solid #1565C0;
  }
  .pq-table thead tr th.c { text-align: center; }
  .pq-table thead tr th.r { text-align: right; }

  .pq-table tbody tr td {
    padding: 8px 10px; border: 1px solid #d0d7e3;
    color: #333; vertical-align: middle;
  }
  .pq-table tbody tr td.c { text-align: center; }
  .pq-table tbody tr td.r { text-align: right; }

  .pq-table tbody tr:nth-child(even) td { background: #f4f7ff; }
  .pq-table tbody tr:nth-child(odd)  td { background: #fff; }

  .pq-table .tr-item-title td {
    background: #e8eef8 !important; font-weight: 700;
    color: #1a237e; font-size: 12px;
  }
  .pq-table .tr-item-notes { font-size: 11px; color: #666; font-weight: 400; margin-left: 6px; }
  .pq-table .tr-material td { padding-left: 22px; }
  .pq-table .tr-subtotal td {
    background: #dde6f5 !important; font-weight: 700;
    border-top: 2px solid #b0bfd8; color: #1a237e;
  }
  .pq-table .tr-empty td { height: 28px; background: #fff !important; }

  /* ── Notes + Totals ── */
  .pq-bottom { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 30px; }
  .pq-notes-box {
    flex: 1; border: 1px solid #d0d7e3; min-height: 90px;
    padding: 10px 14px; font-size: 12px; color: #555; line-height: 1.6;
  }
  .pq-notes-box .notes-placeholder { color: #bbb; font-style: italic; }

  /* ── Totals table with Discount ── */
  .pq-totals { border-collapse: collapse; min-width: 320px; font-size: 13px; }
  .pq-totals td { padding: 8px 16px; border: 1px solid #d0d7e3; }
  .pq-totals .t-label  { color: #555; font-weight: 600; width: 150px; }
  .pq-totals .t-amount { text-align: right; font-weight: 600; color: #222; }
  .pq-totals .tr-discount td {
    background: #fff3e0;
    color: #ff9800;
  }
  .pq-totals .tr-grand td {
    background: #1565C0 !important; color: #fff !important;
    font-weight: 700; font-size: 14px; border-color: #1565C0;
  }

  /* ── Discount Control ── */
  .discount-control {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  .discount-type-buttons {
    display: flex;
    gap: 5px;
    background: #f5f5f5;
    border-radius: 6px;
    padding: 3px;
  }
  .discount-type-btn {
    padding: 4px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    background: transparent;
    color: #666;
    transition: all 0.2s;
  }
  .discount-type-btn.active {
    background: #1565C0;
    color: white;
  }
  .discount-input-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .discount-input {
    width: 100px;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    text-align: right;
  }
  .discount-label {
    font-size: 12px;
    color: #666;
  }

  /* ── Signature Section ── */
  .signature-section {
    margin: 30px 0 20px 0;
    padding: 20px;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .signature-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
  }
  .signature-icon {
    font-size: 20px;
    color: #1565C0;
  }
  .signature-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
    color: #333;
    letter-spacing: 1px;
  }
  .signature-grid {
    display: flex;
    gap: 40px;
    justify-content: space-between;
  }
  .signature-box {
    flex: 1;
    text-align: center;
  }
  .signature-line {
    border-bottom: 1px solid #999;
    margin: 10px 0 5px 0;
    width: 100%;
    min-height: 40px;
  }
  .signature-name {
    font-size: 12px;
    font-weight: 600;
    color: #1a237e;
    margin-bottom: 5px;
  }
  .signature-title {
    font-size: 10px;
    color: #666;
  }
  .signature-date {
    font-size: 10px;
    color: #888;
    margin-top: 5px;
  }
  .edit-signature-btn {
    margin-top: 10px;
    background: #9c27b0;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  /* ── Footer ── */
  .pq-footer {
    text-align: center; padding-top: 18px;
    border-top: 1px solid #e8e8e8;
    font-size: 13px; color: #777; font-style: italic;
  }

  /* ── Loading ── */
  .pq-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; background: #f0f2f5; }
  .pq-spinner {
    width: 46px; height: 46px; border: 3px solid #dde3ec;
    border-top-color: #1565C0; border-radius: 50%;
    animation: pqSpin 0.9s linear infinite; margin-bottom: 16px;
  }
  @keyframes pqSpin { to { transform: rotate(360deg); } }

  /* ── Error ── */
  .pq-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px; background: #f0f2f5; }
  .pq-error h2 { margin: 14px 0 6px; color: #333; }
  .pq-error p  { color: #666; margin-bottom: 20px; }

  /* ── Print ── */
  @media print {
    .pq-action-bar { display: none !important; }
    .logo-modal-overlay { display: none !important; }
    .edit-logo-btn { display: none !important; }
    .edit-signature-btn { display: none !important; }
    .discount-control { display: none !important; }
    .pq-page-wrap  { background: #fff; padding: 0; }
    .pq-paper      { box-shadow: none; padding: 12mm 15mm; max-width: 100%; }
    .pq-table thead tr th,
    .pq-table .tr-item-title td,
    .pq-table .tr-subtotal td,
    .pq-totals .tr-grand td,
    .pq-totals .tr-discount td,
    .pq-section-label {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .company-logo-img {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .signature-line {
      border-bottom: 1px solid #000 !important;
    }
    .images-section {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .pq-action-bar { flex-direction: column; gap: 10px; align-items: stretch; }
    .pq-action-bar .action-group { flex-wrap: wrap; justify-content: center; }
    .pq-paper { padding: 20px 16px; }
    .pq-header { flex-direction: column; gap: 14px; }
    .pq-quote-title { text-align: left; font-size: 20px; }
    .pq-address-grid { grid-template-columns: 1fr; }
    .pq-bottom { flex-direction: column; }
    .pq-totals { min-width: 100%; width: 100%; }
    .signature-grid { flex-direction: column; gap: 20px; }
    .images-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
    .discount-control { flex-direction: column; align-items: flex-end; }
    .company-logo-img {
      max-width: 150px;
      max-height: 50px;
    }
    .brand-name-text {
      font-size: 12px;
    }
  }
`;

/* ✅ FIXED: Helper function to get image URL */
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // Agar pehle se full URL hai
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Backend URL - jo browser mein kaam kar raha hai
  const baseUrl = import.meta.env.VITE_API_URL;
  
  // Image ka full URL banao
  let cleanUrl = imageUrl;
  
  // Agar URL /uploads se shuru ho raha hai to seedha jodo
  if (cleanUrl.startsWith('/uploads')) {
    cleanUrl = cleanUrl;
  } else if (cleanUrl.startsWith('./uploads')) {
    cleanUrl = cleanUrl.substring(1);
  } else if (cleanUrl.startsWith('../uploads')) {
    cleanUrl = cleanUrl.substring(2);
  }
  
  const fullUrl = `${baseUrl}${cleanUrl}`;
  console.log('🖼️ Generated image URL:', fullUrl);
  
  return fullUrl;
};

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const PrintQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCost, setShowCost] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Discount states
  const [discountType, setDiscountType] = useState('percentage');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);
  
  // Signature states
  const [authorizedSignatory, setAuthorizedSignatory] = useState('');
  const [customerSignatory, setCustomerSignatory] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [tempAuthorizedSignatory, setTempAuthorizedSignatory] = useState('');
  const [tempCustomerSignatory, setTempCustomerSignatory] = useState('');
  
  // Logo error state
  const [logoError, setLogoError] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  useEffect(() => {
    if (id) {
      fetchQuotationDetails();
    } else {
      const savedData = localStorage.getItem('printQuotation');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setQuotation(data);
          setLoading(false);
          const savedDiscountType = localStorage.getItem('discountType');
          const savedDiscountPercentage = localStorage.getItem('discountPercentage');
          const savedDiscountFixed = localStorage.getItem('discountFixed');
          if (savedDiscountType) setDiscountType(savedDiscountType);
          if (savedDiscountPercentage) setDiscountPercentage(parseFloat(savedDiscountPercentage));
          if (savedDiscountFixed) setDiscountFixed(parseFloat(savedDiscountFixed));
          localStorage.removeItem('printQuotation');
          return;
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }
      setError('No quotation ID provided');
      setLoading(false);
    }
    
    const savedDiscountType = localStorage.getItem('discountType');
    const savedDiscountPercentage = localStorage.getItem('discountPercentage');
    const savedDiscountFixed = localStorage.getItem('discountFixed');
    if (savedDiscountType) setDiscountType(savedDiscountType);
    if (savedDiscountPercentage) setDiscountPercentage(parseFloat(savedDiscountPercentage));
    if (savedDiscountFixed) setDiscountFixed(parseFloat(savedDiscountFixed));
  }, [id]);

  const loadBusinessProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await getProfile();
      console.log("Business profile loaded:", response);
      
      let profile = null;
      if (response?.data?.data) {
        profile = response.data.data;
      } else if (response?.data) {
        profile = response.data;
      } else if (response) {
        profile = response;
      }
      
      setProfileData(profile);
      
      // Set authorized signatory from profile if available
      if (profile?.ownerName) {
        setAuthorizedSignatory(profile.ownerName);
        setTempAuthorizedSignatory(profile.ownerName);
      } else {
        const savedAuthorized = localStorage.getItem('authorizedSignatory');
        if (savedAuthorized && savedAuthorized !== 'undefined' && savedAuthorized !== 'null') {
          setAuthorizedSignatory(savedAuthorized);
          setTempAuthorizedSignatory(savedAuthorized);
        }
      }
      
      // Set customer signatory from localStorage
      const savedCustomer = localStorage.getItem('customerSignatory');
      if (savedCustomer && savedCustomer !== 'undefined' && savedCustomer !== 'null') {
        setCustomerSignatory(savedCustomer);
        setTempCustomerSignatory(savedCustomer);
      }
      
    } catch (error) {
      console.error("Error loading business profile:", error);
      // Fallback to localStorage if profile not found
      const savedAuthorized = localStorage.getItem('authorizedSignatory');
      if (savedAuthorized && savedAuthorized !== 'undefined' && savedAuthorized !== 'null') {
        setAuthorizedSignatory(savedAuthorized);
        setTempAuthorizedSignatory(savedAuthorized);
      }
      
      const savedCustomer = localStorage.getItem('customerSignatory');
      if (savedCustomer && savedCustomer !== 'undefined' && savedCustomer !== 'null') {
        setCustomerSignatory(savedCustomer);
        setTempCustomerSignatory(savedCustomer);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchQuotationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuotationById(id);
      if (response.data?.success) {
        setQuotation(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch quotation');
      }
    } catch (err) {
      console.error('Error fetching quotation:', err);
      setError(err.message || 'Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (index, url) => {
    console.error(`Failed to load image ${index + 1}:`, url);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleLogoError = () => {
    setLogoError(true);
  };

  const handleSignatureClick = () => {
    setTempAuthorizedSignatory(authorizedSignatory);
    setTempCustomerSignatory(customerSignatory);
    setShowSignatureModal(true);
  };

  const handleSaveSignatures = () => {
    if (tempAuthorizedSignatory && tempAuthorizedSignatory.trim()) {
      setAuthorizedSignatory(tempAuthorizedSignatory.trim());
      localStorage.setItem('authorizedSignatory', tempAuthorizedSignatory.trim());
    }
    
    if (tempCustomerSignatory && tempCustomerSignatory.trim()) {
      setCustomerSignatory(tempCustomerSignatory.trim());
      localStorage.setItem('customerSignatory', tempCustomerSignatory.trim());
    }
    
    setShowSignatureModal(false);
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    localStorage.setItem('discountType', type);
  };

  const handleDiscountPercentageChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const limitedValue = Math.min(value, 100);
    setDiscountPercentage(limitedValue);
    localStorage.setItem('discountPercentage', limitedValue);
  };

  const handleDiscountFixedChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountFixed(value);
    localStorage.setItem('discountFixed', value);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return Number(amount).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPKR = (amount) => {
    return `PKR ${formatCurrency(amount)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-PK', {
        year: 'numeric', month: '2-digit', day: '2-digit',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const subtotal = quotation?.items?.reduce((s, i) => s + (i.subtotal || 0), 0) || 0;
  
  let discountAmount = 0;
  let discountDisplay = '';
  
  if (discountType === 'percentage') {
    discountAmount = (subtotal * discountPercentage) / 100;
    discountDisplay = `${discountPercentage}%`;
  } else {
    discountAmount = discountFixed;
    discountDisplay = `PKR ${formatCurrency(discountFixed)}`;
  }
  
  const totalAfterDiscount = subtotal - discountAmount;

  const handlePrint = () => window.print();

  const handlePrintWithoutCost = () => {
    setShowCost(false);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowCost(true), 500);
    }, 100);
  };

  const handleDownloadPDF = () => { 
    const base =   import.meta.env.VITE_API_URL;
    const mode = showCost ? 'with-cost' : 'without-cost';
    window.open(`${base}/api/quotations/print/${id}/${mode}`, '_blank');
  };

  const colCount = showCost ? 4 : 2;

  if (loading || profileLoading) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="pq-loading">
          <div className="pq-spinner" />
          <p style={{ color: '#666' }}>Loading quotation details…</p>
        </div>
      </>
    );
  }

  if (error || !quotation) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="pq-error">
          <FiAlertCircle size={50} color="#f44336" />
          <h2>Error Loading Quotation</h2>
          <p>{error || 'Quotation not found'}</p>
          <button className="pq-btn pq-btn--gray" onClick={() => navigate('/all-Quotation')}>
            <FiArrowLeft /> Back to Quotations
          </button>
        </div>
      </>
    );
  }

  // Get logo URL from profile
  const getLogoUrl = () => {
    if (!profileData) return null;
    
    if (profileData.logoUrl) {
      return profileData.logoUrl;
    } else if (profileData.logo) {
      const baseURL = 'http://';
      return `${baseURL}/${profileData.logo}`;
    }
    return null;
  };

  const logoUrl = getLogoUrl();
  const shopName = profileData?.shopName || 'Haider Velding Wala';
  const ownerName = profileData?.ownerName || 'Muhammad Haider';
  const businessPhone = profileData?.phone || '';
  const businessWhatsapp = profileData?.whatsapp || '';
  const businessAddress = profileData?.address || '';
  const businessGst = profileData?.gstNumber || '';
  const businessFooterNote = profileData?.footerNote || 'Thank you for your business!';

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {showSignatureModal && (
        <div className="logo-modal-overlay" onClick={() => setShowSignatureModal(false)}>
          <div className="logo-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Signature Settings</h3>
            <input
              type="text"
              className="signature-name-input"
              placeholder="Authorized Signatory Name"
              value={tempAuthorizedSignatory}
              onChange={(e) => setTempAuthorizedSignatory(e.target.value)}
            />
            <input
              type="text"
              className="signature-name-input"
              placeholder="Customer Signatory Name (optional)"
              value={tempCustomerSignatory}
              onChange={(e) => setTempCustomerSignatory(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="pq-btn pq-btn--blue" onClick={handleSaveSignatures}>
                Save Signatures
              </button>
              <button className="pq-btn pq-btn--gray" onClick={() => setShowSignatureModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pq-action-bar">
        <button className="pq-btn pq-btn--gray" onClick={() => navigate('/all-Quotation')}>
          <FiArrowLeft /> Back
        </button>
        <div className="action-group">
          <button className="pq-btn pq-btn--purple" onClick={handleSignatureClick}>
            <FiEdit2 /> Signatures
          </button>
          <button className="pq-btn pq-btn--blue" onClick={handlePrint}>
            <FiPrinter /> Print with Cost
          </button>
          <button className="pq-btn pq-btn--green" onClick={handlePrintWithoutCost}>
            <FiPrinter /> Print without Cost
          </button>
          <button className="pq-btn pq-btn--blue" onClick={handleDownloadPDF}>
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      <div className="pq-page-wrap">
        <div className="pq-paper" ref={printRef}>
          <div className="pq-header">
            <div className="pq-logo-box">
              {logoUrl && !logoError ? (
                <>
                  <div className="logo-image-container">
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="company-logo-img"
                      onError={handleLogoError}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="brand-name-text">{shopName}</div>
                </>
              ) : (
                <div style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <div className="pq-logo-icon">✦</div>
                  <div className="pq-logo-name">{shopName}</div>
                  <div className="pq-logo-sub">Workforce Software</div>
                </div>
              )}
            </div>
            <div>
              <div className="pq-quote-title">Job Price Quote</div>
              <table className="pq-meta-table">
                <tbody>
                  <tr>
                    <td className="meta-label">Quote Number:</td>
                    <td className="meta-val">
                      {quotation.quotationNumber || `Q-${quotation._id?.slice(-6)}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-label">Issue Date:</td>
                    <td className="meta-val">{formatDate(quotation.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">Valid Through:</td>
                    <td className="meta-val">{formatDate(quotation.validUntil)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pq-address-grid">
            <div>
              <div className="pq-section-label">Sender</div>
              <div className="pq-address-box">
                <p className="addr-name">{shopName}</p>
                {businessAddress && <p>{businessAddress}</p>}
                {businessPhone && <p>Phone: {businessPhone}</p>}
                {businessWhatsapp && <p>WhatsApp: {businessWhatsapp}</p>}
                {businessGst && <p>GST/NTN: {businessGst}</p>}
                {(!businessAddress && !businessPhone && !businessWhatsapp) && (
                  <>
                    <p>[Company Address Line 1]</p>
                    <p>[Company Address Line 2]</p>
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="pq-section-label">Receiver</div>
              <div className="pq-address-box">
                <p className="addr-name">{quotation.customerName || '[Company Name]'}</p>
                <p>{quotation.customerAddress || '[Company Address Line 1]'}</p>
                <p>{quotation.customerPhone || '[Company Phone Number]'}</p>
              </div>
            </div>
          </div>

          {/* ✅ FIXED: REFERENCE IMAGES SECTION with correct URL */}
          {quotation.images && quotation.images.length > 0 ? (
            <div className="images-section">
              <div className="images-header">
                <FiImage />
                <span>Reference Images ({quotation.images.length})</span>
              </div>
              <div className="images-grid">
                {quotation.images.map((image, index) => {
                  const fullImageUrl = getImageUrl(image.url);
                  const hasError = imageErrors[index];
                  
                  return (
                    <div key={index} className="image-item">
                      {!hasError ? (
                        <img 
                          src={fullImageUrl} 
                          alt={image.description || `Reference Image ${index + 1}`}
                          onError={() => handleImageError(index, fullImageUrl)}
                          onLoad={() => console.log(`✅ Image ${index} loaded:`, fullImageUrl)}
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: '#f5f5f5',
                          color: '#999',
                          fontSize: '12px',
                          flexDirection: 'column'
                        }}>
                          <FiImage size={24} />
                          <span style={{ fontSize: '10px', marginTop: '5px' }}>Failed to load</span>
                        </div>
                      )}
                      {image.description && (
                        <div className="image-description">{image.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="images-section">
              <div className="images-header">
                <FiImage />
                <span>Reference Images</span>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No reference images uploaded
              </div>
            </div>
          )}

          <table className="pq-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="c">QTY</th>
                {showCost && <th className="r">Unit Price</th>}
                {showCost && <th className="r">Subtotal</th>}
               </tr>
            </thead>
            <tbody>
              {quotation.items && quotation.items.length > 0 ? (
                quotation.items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="tr-item-title">
                      <td colSpan={colCount}>
                        {item.title}
                        {item.notes && (
                          <span className="tr-item-notes">— {item.notes}</span>
                        )}
                      </td>
                    </tr>
                    {item.materials?.map((mat, midx) => {
                      const mSub = mat.quantity * mat.pricePerUnit;
                      return (
                        <tr key={midx} className="tr-material">
                          <td>• {mat.name}</td>
                          <td className="c">{mat.quantity} {mat.unit}</td>
                          {showCost && (
                            <>
                              <td className="r">{formatPKR(mat.pricePerUnit)}</td>
                              <td className="r">{formatPKR(mSub)}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                    {showCost && (
                      <tr className="tr-subtotal">
                        <td colSpan={3} className="r">
                          Subtotal for {item.title}:
                        </td>
                        <td className="r">{formatPKR(item.subtotal)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i} className="tr-empty">
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    {showCost && <td>&nbsp;</td>}
                    {showCost && <td>&nbsp;</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pq-bottom">
            <div className="pq-notes-box">
              {quotation.notes
                ? <><strong>Notes: </strong>{quotation.notes}</>
                : <span className="notes-placeholder">[Notes]</span>
              }
            </div>
            <div>
              <div className="discount-control">
                <div className="discount-type-buttons">
                  <button
                    className={`discount-type-btn ${discountType === 'percentage' ? 'active' : ''}`}
                    onClick={() => handleDiscountTypeChange('percentage')}
                  >
                    <FiPercent size={12} /> %
                  </button>
                  <button
                    className={`discount-type-btn ${discountType === 'fixed' ? 'active' : ''}`}
                    onClick={() => handleDiscountTypeChange('fixed')}
                  >
                    <FiDollarSign size={12} /> Fixed
                  </button>
                </div>
                
                {discountType === 'percentage' ? (
                  <div className="discount-input-group">
                    <span className="discount-label">Discount:</span>
                    <input
                      type="number"
                      className="discount-input"
                      value={discountPercentage}
                      onChange={handleDiscountPercentageChange}
                      min="0"
                      max="100"
                      step="1"
                    />
                    <span>%</span>
                  </div>
                ) : (
                  <div className="discount-input-group">
                    <span className="discount-label">Discount:</span>
                    <input
                      type="number"
                      className="discount-input"
                      value={discountFixed}
                      onChange={handleDiscountFixedChange}
                      min="0"
                      step="100"
                    />
                    <span>PKR</span>
                  </div>
                )}
              </div>
              
              <table className="pq-totals">
                <tbody>
                  <tr>
                    <td className="t-label">SUBTOTAL</td>
                    <td className="t-amount">{formatPKR(subtotal)}</td>
                  </tr>
                  {discountAmount > 0 && (
                    <tr className="tr-discount">
                      <td className="t-label">DISCOUNT ({discountDisplay})</td>
                      <td className="t-amount">- {formatPKR(discountAmount)}</td>
                    </tr>
                  )}
                  <tr className="tr-grand">
                    <td className="t-label">TOTAL</td>
                    <td className="t-amount">{formatPKR(totalAfterDiscount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="signature-section">
            <div className="signature-header">
              <FiEdit2 className="signature-icon" />
              <h3>AUTHORIZED SIGNATURES</h3>
              <button className="edit-signature-btn" onClick={handleSignatureClick}>
                <FiEdit2 /> Edit
              </button>
            </div>
            <div className="signature-grid">
              <div className="signature-box">
                <div className="signature-line"></div>
                <div className="signature-name">{authorizedSignatory || ownerName}</div>
                <div className="signature-title">Authorized Signatory</div>
                <div className="signature-date">Date: {formatDate(new Date())}</div>
              </div>
              <div className="signature-box">
                <div className="signature-line"></div>
                <div className="signature-name">{customerSignatory || '_________________________'}</div>
                <div className="signature-title">Customer Signatory</div>
                <div className="signature-date">Date: {formatDate(new Date())}</div>
              </div>
            </div>
          </div>

          <div className="pq-footer">
            {businessFooterNote}
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintQuotation;