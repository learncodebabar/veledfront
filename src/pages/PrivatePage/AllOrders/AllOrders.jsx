// src/pages/PrivatePage/AllOrders/AllOrders.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiPackage, FiSearch, FiCalendar,
  FiChevronRight, FiRefreshCw, FiX, FiDollarSign,
  FiPhone, FiClock, FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

import {
  BsCurrencyRupee, BsWallet2
} from 'react-icons/bs';

import {
  MdPendingActions, MdOutlineLocalShipping,
  MdCheckCircle
} from 'react-icons/md';

import Sidebar from '../../../components/Sidebar/Sidebar';
import { getAllOrders } from '../../../api/orderApi';
import './AllOrders.css';

const AllOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderFilter = location.state?.orderFilter;
  const filterValue = location.state?.filterValue;
  const fromDashboard = location.state?.fromDashboard;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);

  // Order status — backend enum: pending | in-progress | completed
  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'var(--text-muted)' },
    { value: 'pending', label: 'Pending', icon: <MdPendingActions />, color: 'var(--warning-color)' },
    { value: 'in-progress', label: 'In Progress', icon: <MdOutlineLocalShipping />, color: 'var(--info-color)' },
    { value: 'completed', label: 'Completed', icon: <MdCheckCircle />, color: 'var(--success-color)' }
  ];

  // Payment filter options — backend paymentStatus enum: pending | partial | paid
  const paymentFilterOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending Payment' },
    { value: 'partial', label: 'Partial Payment' },
    { value: 'paid', label: 'Complete Payment' },
    { value: 'completed_payment_pending', label: 'Completed Order Payment Pending' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Amount' },
    { value: 'lowest', label: 'Lowest Amount' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  // Dashboard سے آنے والا filter apply کریں
  useEffect(() => {
    if (fromDashboard && filterValue) {
      if (orderFilter === "payment") {
        // Dashboard filterValue کو backend paymentStatus enum سے map کریں
        const paymentMap = {
          pending_payment: 'pending',
          partial_payment: 'partial',
          complete_payment: 'paid',
          completed_payment_pending: 'completed_payment_pending'
        };
        setPaymentFilter(paymentMap[filterValue] || 'all');
        setStatusFilter("all");
      }

      if (orderFilter === "status") {
        setStatusFilter(filterValue);
        setPaymentFilter("all");
      }
    }
  }, [fromDashboard, filterValue, orderFilter]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();

      let ordersData = [];
      if (response.data?.data) {
        ordersData = response.data.data;
      } else if (response.data) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      }

      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.billNumber?.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term) ||
        order.customer?.phone?.includes(term)
      );
    }

    // Order status filter — backend enum: pending | in-progress | completed
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter — backend paymentStatus enum: pending | partial | paid
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'completed_payment_pending') {
        // completed order لیکن payment ابھی paid نہیں
        filtered = filtered.filter(order =>
          order.status === 'completed' && order.paymentStatus !== 'paid'
        );
      } else {
        // directly backend paymentStatus field سے match کریں
        filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
        case 'oldest':
          return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
        case 'highest':
          return (b.finalTotal || 0) - (a.finalTotal || 0);
        case 'lowest':
          return (a.finalTotal || 0) - (b.finalTotal || 0);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setSearchTerm('');
    window.history.replaceState({}, document.title);
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status) || statusOptions[0];
    return (
      <span className="allorder-status-badge" style={{
        backgroundColor: `var(--${status === 'pending'
          ? 'warning-color'
          : status === 'in-progress'
            ? 'info-color'
            : status === 'completed'
              ? 'success-color'
              : 'text-muted'})20`,
        color: option.color,
        borderColor: option.color + '40'
      }}>
        {option.icon && <span className="allorder-status-icon">{option.icon}</span>}
        <span>{option.label}</span>
      </span>
    );
  };

  // ✅ backend paymentStatus field استعمال کریں: pending | partial | paid
  const getPaymentStatusBadge = (order) => {
    const paymentStatus = order.paymentStatus || 'pending';

    if (paymentStatus === 'paid') {
      return { status: 'paid', label: 'Paid', icon: <FiCheckCircle />, color: '#10b981' };
    } else if (paymentStatus === 'partial') {
      return { status: 'partial', label: 'Partial', icon: <FiClock />, color: '#3b82f6' };
    } else {
      return { status: 'pending', label: 'Pending', icon: <FiAlertCircle />, color: '#f59e0b' };
    }
  };

  const formatCurrency = (amount) => {
    return `Rs ${Number(amount || 0).toLocaleString('en-PK')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="allorder-container">
        <Sidebar />
        <div className="allorder-content allorder-loading">
          <div className="allorder-spinner"></div>
          <h2>Loading Orders...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="allorder-container">
        <Sidebar />
        <div className="allorder-content allorder-error">
          <FiPackage className="allorder-error-icon" />
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
          <button onClick={fetchOrders} className="allorder-refresh-btn">
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="allorder-container sideber-container-Mobile">
      <Sidebar />

      <div className="allorder-content">
        <div className="allorder-header">
          <div className="allorder-header-title">
            <h1>All Orders</h1>
            <p>Manage and view all your orders</p>
          </div>

          <div className="allorder-header-actions">
            <button
              className="allorder-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? 'allorder-spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="allorder-search-filter-bar">
          <div className="allorder-search-wrapper">
            <FiSearch className="allorder-search-icon" />
            <input
              type="text"
              placeholder="Search by order ID, customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="allorder-search-input"
            />
            {searchTerm && (
              <button className="allorder-clear-search" onClick={clearSearch}>
                <FiX />
              </button>
            )}
          </div>

          <div className="allorder-filter-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="allorder-filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="allorder-filter-select"
            >
              {paymentFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="allorder-filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button onClick={clearFilters} className="clear-filter-btn">
              <FiX /> Clear Filters
            </button>
          </div>
        </div>

        <div className="allorder-results-info">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="allorder-no-orders">
            <FiPackage className="allorder-no-data-icon" />
            <h3>No orders found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="allorder-orders-grid">
            {filteredOrders.map((order) => {
              const paymentStatus = getPaymentStatusBadge(order);

              return (
                <div
                  key={order._id}
                  className="allorder-order-card"
                  onClick={() => navigate(`/customer-orders/${order._id}`)}
                >
                  <div className="allorder-order-card-header">
                    <div className="allorder-order-title">
                      <h3 className="allorder-order-id">{order.billNumber || order._id?.slice(-8)}</h3>
                      <span className="allorder-order-date">
                        <FiCalendar />
                        {formatDate(order.date || order.createdAt)}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="allorder-order-customer-info">
                    <div className="allorder-customer-avatar">
                      {order.customer?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="allorder-customer-details">
                      <h4 className="allorder-customer-name">{order.customer?.name || 'Unknown Customer'}</h4>
                      <p className="allorder-customer-phone">
                        <FiPhone />
                        {order.customer?.phone || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="allorder-order-details">
                    <div className="allorder-detail-item">
                      <FiDollarSign className="allorder-detail-icon" />
                      <div>
                        <span className="allorder-detail-label">Final Total</span>
                        <span className="allorder-detail-value">{formatCurrency(order.finalTotal)}</span>
                      </div>
                    </div>

                    <div className="allorder-detail-item">
                      <BsWallet2 className="allorder-detail-icon" />
                      <div>
                        <span className="allorder-detail-label">Advance</span>
                        <span className="allorder-detail-value">{formatCurrency(order.advancePayment || 0)}</span>
                      </div>
                    </div>

                    <div className="allorder-detail-item">
                      <BsCurrencyRupee className="allorder-detail-icon" />
                      <div>
                        <span className="allorder-detail-label">Remaining</span>
                        {/* ✅ backend کا remainingBalance field استعمال کریں */}
                        <span className="allorder-detail-value">{formatCurrency(order.remainingBalance ?? order.finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="allorder-order-footer">
                    <div className="allorder-payment-status" style={{ color: paymentStatus.color }}>
                      <span
                        className={`allorder-status-dot allorder-status-dot-${paymentStatus.status}`}
                        style={{ backgroundColor: paymentStatus.color }}
                      ></span>
                      <span>Payment: {paymentStatus.label}</span>
                      {paymentStatus.status === 'paid' && (
                        <FiCheckCircle style={{ marginLeft: '4px' }} />
                      )}
                    </div>

                    <button className="allorder-view-details-btn">
                      View Details <FiChevronRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default AllOrders;