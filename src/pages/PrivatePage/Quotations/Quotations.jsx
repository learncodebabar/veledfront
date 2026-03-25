import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, FiPlus, FiSearch, 
  FiEye, FiDownload, FiEdit2, FiTrash2,
  FiUser, FiPackage, FiCheckCircle,
  FiXCircle, FiClock, FiRefreshCw
} from 'react-icons/fi';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { getAllQuotations, deleteQuotation } from '../../../api/quotationApi';
import './Quotations.css';
//hell
const AllQuotations = () => {
  const navigate = useNavigate();
  
  // States
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ];

  // Load quotations on component mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  // Filter quotations when search or status changes
  useEffect(() => {
    filterQuotations();
  }, [searchTerm, statusFilter, quotations]);

  // Fetch all quotations
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await getAllQuotations();
      if (response.data && response.data.success) {
        setQuotations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      showToast('Failed to load quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter quotations based on search and status
  const filterQuotations = () => {
    let filtered = [...quotations];

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    setFilteredQuotations(filtered);
  };

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs ${Number(amount).toFixed(2)}`;
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'all-quotations-status-draft',
      sent: 'all-quotations-status-sent',
      accepted: 'all-quotations-status-accepted',
      rejected: 'all-quotations-status-rejected',
      expired: 'all-quotations-status-expired'
    };
    return statusMap[status] || 'all-quotations-status-draft';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'draft': return <FiClock />;
      case 'sent': return <FiRefreshCw />;
      case 'accepted': return <FiCheckCircle />;
      case 'rejected': return <FiXCircle />;
      case 'expired': return <FiClock />;
      default: return <FiClock />;
    }
  };

  // Handle view quotation
  const handleView = (id) => {
    navigate(`/quotations/${id}`);
  };

  // Handle edit quotation
  const handleEdit = (id) => {
    navigate(`/quotations/edit/${id}`);
  };

  // Handle delete quotation
  const handleDelete = async () => {
    if (!selectedQuotation) return;
    
    try {
      const response = await deleteQuotation(selectedQuotation._id);
      if (response.data && response.data.success) {
        setQuotations(quotations.filter(q => q._id !== selectedQuotation._id));
        showToast('Quotation deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      showToast('Failed to delete quotation', 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedQuotation(null);
    }
  };

  // Handle print quotation
  const handlePrint = (id) => {
    window.open(`/quotations/print/${id}`, '_blank');
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="all-quotations-page">
      <Sidebar />
      
      <div className="all-quotations-content">
        {/* Toast Notification */}
        {toast.show && (
          <div className={`all-quotations-toast all-quotations-toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ show: false, message: '', type: '' })}>×</button>
          </div>
        )}

        {/* Header */}
        <div className="all-quotations-header">
          <div className="all-quotations-header-left">
            <h1>
              <FiFileText className="all-quotations-header-icon" />
              Quotations Management
            </h1>
            <p className="all-quotations-header-subtitle">
              Total Quotations: {filteredQuotations.length} of {quotations.length}
            </p>
          </div>
          <button 
            className="all-quotations-btn-primary"
            onClick={() => navigate('/QuotationCustomer')}
          >
            <FiPlus /> New Quotation
          </button>
        </div>

        {/* Filters */}
        <div className="all-quotations-filters">
          <div className="all-quotations-search-box">
            <FiSearch className="all-quotations-search-icon" />
            <input
              type="text"
              placeholder="Search by quotation # or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="all-quotations-filter-group">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="all-quotations-filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button 
              className="all-quotations-btn-outline"
              onClick={resetFilters}
            >
              <FiRefreshCw /> Reset
            </button>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="all-quotations-table-container">
          {loading ? (
            <div className="all-quotations-loading">
              <div className="all-quotations-spinner"></div>
              <p>Loading quotations...</p>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="all-quotations-empty">
              <FiFileText className="all-quotations-empty-icon" />
              <h3>No quotations found</h3>
              <p>
                {quotations.length === 0 
                  ? 'Create your first quotation to get started' 
                  : 'Try adjusting your filters'}
              </p>
              {quotations.length === 0 && (
                <button 
                  className="all-quotations-btn-primary"
                  onClick={() => navigate('/quotations/add')}
                >
                  <FiPlus /> Create Quotation
                </button>
              )}
            </div>
          ) : (
            <table className="all-quotations-table">
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id}>
                    {/* Quotation # Column */}
                    <td className="all-quotations-number">
                      <span className="all-quotations-number-badge">
                        {quotation.quotationNumber || 'Q-xxxx'}
                      </span>
                    </td>

                    {/* Customer Column */}
                    <td>
                      <div className="all-quotations-customer-info">
                        <FiUser className="all-quotations-customer-icon" />
                        <span className="all-quotations-customer-name">{quotation.customerName}</span>
                      </div>
                    </td>

                    {/* Items Column */}
                    <td>
                      <div className="all-quotations-items-info">
                        <FiPackage className="all-quotations-items-icon" />
                        <div className="all-quotations-items-details">
                          <span className="all-quotations-items-count">
                            {quotation.items?.length || 0} Items
                          </span>
                          <span className="all-quotations-items-total">
                            {formatCurrency(quotation.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td>
                      <span className={`all-quotations-status-badge ${getStatusBadge(quotation.status)}`}>
                        {getStatusIcon(quotation.status)}
                        {quotation.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td>
                      <div className="all-quotations-action-buttons">
                        <button 
                          className="all-quotations-btn-icon all-quotations-view" 
                          onClick={() => handleView(quotation._id)}
                          title="View Quotation"
                        >
                          <FiEye />
                        </button>
                        <button 
                          className="all-quotations-btn-icon all-quotations-edit" 
                          onClick={() => handleEdit(quotation._id)}
                          title="Edit Quotation"
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className="all-quotations-btn-icon all-quotations-print" 
                          onClick={() => handlePrint(quotation._id)}
                          title="Print Quotation"
                        >
                          <FiDownload />
                        </button>
                        <button 
                          className="all-quotations-btn-icon all-quotations-delete" 
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Quotation"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="all-quotations-modal-overlay">
            <div className="all-quotations-modal-content">
              <h3>Delete Quotation</h3>
              <p>
                Are you sure you want to delete quotation{' '}
                <strong>{selectedQuotation?.quotationNumber}</strong>?
              </p>
              <div className="all-quotations-modal-actions">
                <button 
                  className="all-quotations-btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="all-quotations-btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllQuotations;