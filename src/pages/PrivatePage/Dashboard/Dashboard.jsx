import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDollarSign, FiPackage, FiTrendingUp, FiUsers,
  FiCalendar, FiFilter, FiDownload, FiRefreshCw,
  FiPlusCircle, FiX, FiSave, FiCreditCard, FiClock,
  FiCheckCircle, FiAlertCircle, FiShoppingBag,
  FiUser, FiBox, FiActivity, FiBarChart2
} from 'react-icons/fi';
import {
  BsCurrencyRupee, BsBoxSeam, BsGraphUp, BsPeople,
  BsTruck, BsWallet2, BsCashStack, BsPieChart
} from 'react-icons/bs';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { getAllOrders } from '../../../api/orderApi';
import { getAllExpenses as getCustomerExpenses } from '../../../api/expenseApi';
import { getAllExpenses as getAdminExpenses, createExpense as createAdminExpense } from '../../../api/adminexpenseApi';
import { getAllCustomers } from '../../../api/customerApi';
import { getAllJobs } from '../../../api/jobApi';
import { getAllPayments } from '../../../api/paymentApi';
import { getAllAdminPayments, createAdminPayment } from '../../../api/adminPaymentApi';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [customerExpenses, setCustomerExpenses] = useState([]);
  const [adminExpenses, setAdminExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  
  // Summary stats
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalJobs: 0,
    pendingPaymentOrders: 0,
    partialPaymentOrders: 0,
    completePaymentOrders: 0,
    delayedOrders: 0,
    activeOrders: 0,
    priceOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    const numAmount = Number(amount || 0);
    return `Rs ${numAmount.toFixed(2).toLocaleString('en-PK')}`;
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en-PK');
  };

  const roundToTwoDecimals = (value) => {
    return Number((value).toFixed(2));
  };

  // Handle order card click - navigate to All Orders with filter
  const handleOrderCardClick = (filterType, filterValue) => {
    navigate('/all-orders', { 
      state: { 
        orderFilter: filterType,
        filterValue: filterValue,
        fromDashboard: true 
      } 
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersRes, customerExpensesRes, adminExpensesRes, customersRes, jobsRes, paymentsRes, adminPaymentsRes] = await Promise.all([
        getAllOrders(),
        getCustomerExpenses({ limit: 1000 }),
        getAdminExpenses({ limit: 1000 }),
        getAllCustomers(),
        getAllJobs(),
        getAllPayments(),
        getAllAdminPayments({ limit: 1000 })
      ]);

      const ordersData = ordersRes.data?.data || ordersRes.data || ordersRes || [];
      setOrders(ordersData);

      let customerExpensesData = [];
      if (customerExpensesRes?.data?.data) {
        customerExpensesData = customerExpensesRes.data.data;
      } else if (customerExpensesRes?.data) {
        customerExpensesData = customerExpensesRes.data;
      } else if (Array.isArray(customerExpensesRes)) {
        customerExpensesData = customerExpensesRes;
      }
      setCustomerExpenses(customerExpensesData);

      let adminExpensesData = [];
      if (adminExpensesRes?.data?.data) {
        adminExpensesData = adminExpensesRes.data.data;
      } else if (adminExpensesRes?.data) {
        adminExpensesData = adminExpensesRes.data;
      } else if (Array.isArray(adminExpensesRes)) {
        adminExpensesData = adminExpensesRes;
      }
      setAdminExpenses(adminExpensesData);

      let adminPaymentsData = [];
      if (adminPaymentsRes?.data?.data) {
        adminPaymentsData = adminPaymentsRes.data.data;
      } else if (adminPaymentsRes?.data) {
        adminPaymentsData = adminPaymentsRes.data;
      } else if (Array.isArray(adminPaymentsRes)) {
        adminPaymentsData = adminPaymentsRes;
      }
      setAdminPayments(adminPaymentsData);

      const allExpenses = [...customerExpensesData, ...adminExpensesData];
      const customersData = customersRes.data?.data || customersRes.data || customersRes || [];
      setCustomers(customersData);

      const jobsData = jobsRes.data?.data || jobsRes.data || jobsRes || [];
      setJobs(jobsData);

      const paymentsData = paymentsRes.data?.data || paymentsRes.data || paymentsRes || [];
      setPayments(paymentsData);

      const newSummary = calculateSummaries(ordersData, allExpenses, customersData, jobsData, paymentsData, adminPaymentsData);
      setSummary(newSummary);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (ordersData, allExpenses, customersData, jobsData, paymentsData, adminPaymentsData) => {
    const filteredOrders = filterByDateRange(ordersData);
    const filteredAllExpenses = filterByDateRange(allExpenses);
    const filteredPayments = filterByDateRange(paymentsData);
    const filteredAdminPayments = filterByDateRange(adminPaymentsData);
    
    // Revenue calculations
    const totalAdvance = filteredOrders.reduce((sum, order) => {
      return sum + roundToTwoDecimals(order.advancePayment || 0);
    }, 0);
    
    const totalPaymentsAmount = filteredPayments.reduce((sum, payment) => {
      return sum + roundToTwoDecimals(payment.amount || 0);
    }, 0);
    
    const totalAdminPaymentsAmount = filteredAdminPayments.reduce((sum, payment) => {
      return sum + roundToTwoDecimals(payment.amount || 0);
    }, 0);
    
    const totalRevenue = roundToTwoDecimals(totalAdvance + totalPaymentsAmount + totalAdminPaymentsAmount);
    const totalExpenses = roundToTwoDecimals(filteredAllExpenses.reduce((sum, expense) => {
      return sum + roundToTwoDecimals(expense.amount || 0);
    }, 0));

    // Payment status counts
    let pendingPayment = 0;
    let partialPayment = 0;
    let completePayment = 0;
    let delayedOrders = 0;
    let activeOrders = 0;
    let completedOrders = 0;
    let priceOrders = 0;

    const today = new Date();

    filteredOrders.forEach(order => {
      const advance = order.advancePayment || 0;
      const finalTotal = order.finalTotal || 0;
      
      if (advance >= finalTotal) {
        completePayment++;
      } else if (advance > 0) {
        partialPayment++;
      } else {
        pendingPayment++;
      }

      // Order status counts
      if (order.status === 'completed') {
        completedOrders++;
      } else if (order.status === 'in-progress') {
        activeOrders++;
      } else if (order.status === 'pending') {
        priceOrders++;
      }

      // Delayed orders (due date passed and not completed)
      if (order.dueDate && new Date(order.dueDate) < today && order.status !== 'completed') {
        delayedOrders++;
      }
    });

    return {
      totalRevenue,
      totalExpenses,
      totalProfit: roundToTwoDecimals(totalRevenue - totalExpenses),
      totalOrders: filteredOrders.length,
      totalCustomers: customersData.length,
      totalJobs: jobsData.length,
      pendingPaymentOrders: pendingPayment,
      partialPaymentOrders: partialPayment,
      completePaymentOrders: completePayment,
      delayedOrders: delayedOrders,
      activeOrders: activeOrders,
      priceOrders: priceOrders,
      completedOrders: completedOrders
    };
  };

  const filterByDateRange = (data) => {
    if (!data || !Array.isArray(data)) return [];
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return data.filter(item => {
      if (!item) return false;
      const itemDate = new Date(item.date || item.createdAt || Date.now());
      return itemDate >= start && itemDate <= end;
    });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="dashboard__container">
        <Sidebar />
        <div className="dashboard__content dashboard__content--loading">
          <div className="dashboard__spinner"></div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard__container">
        <Sidebar />
        <div className="dashboard__content dashboard__content--error">
          <FiPackage className="dashboard__error-icon" />
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="dashboard__refresh-btn">
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard__container">
      <Sidebar />
      
      <div className="dashboard__content">
        {/* Header with Title and Date Range */}
        <div className="dashboard__header">
          <div className="dashboard__header-left">
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Welcome back, Admin</p>
          </div>
          
          <div className="dashboard__header-right">
            <div className="dashboard__date-range">
              <div className="dashboard__date-input">
                <FiCalendar className="dashboard__date-icon" />
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <span>to</span>
              <div className="dashboard__date-input">
                <FiCalendar className="dashboard__date-icon" />
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
              <button onClick={handleRefresh} className="dashboard__filter-btn">
                <FiFilter /> Apply
              </button>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="dashboard__financial-section">
          <div className="dashboard__financial-card dashboard__financial-card--balance">
            <div className="dashboard__financial-icon">
              <BsCurrencyRupee />
            </div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">Balance</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalRevenue)}</span>
            </div>
          </div>

          <div className="dashboard__financial-card dashboard__financial-card--expenses">
            <div className="dashboard__financial-icon">
              <BsWallet2 />
            </div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">Total Exp</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalExpenses)}</span>
            </div>
          </div>

          <div className="dashboard__financial-card dashboard__financial-card--profit">
            <div className="dashboard__financial-icon">
              <FiTrendingUp />
            </div>
            <div className="dashboard__financial-content">
              <span className="dashboard__financial-label">NET Profit</span>
              <span className="dashboard__financial-value">{formatCurrency(summary.totalProfit)}</span>
            </div>
          </div>
        </div>

        {/* Orders Section - Clickable Cards */}
        <div className="dashboard__orders-section">
          <div className="dashboard__orders-header">
            <h3>Orders</h3>
            <span className="dashboard__orders-total">{formatNumber(summary.totalOrders)}</span>
          </div>
          
          <div className="dashboard__orders-grid">
            {/* Ordered Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('ordered', 'all')}>
              <div className="dashboard__order-icon dashboard__order-icon--ordered">
                <FiShoppingBag />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Ordered</span>
                <span className="dashboard__order-value">{formatNumber(summary.totalOrders)}</span>
              </div>
            </div>

            {/* Detail Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('detail', 'all')}>
              <div className="dashboard__order-icon dashboard__order-icon--detail">
                <FiActivity />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Detail</span>
                <span className="dashboard__order-value">{formatNumber(summary.totalOrders)}</span>
              </div>
            </div>

            {/* Pending Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('pending', 'pending_payment')}>
              <div className="dashboard__order-icon dashboard__order-icon--pending">
                <FiClock />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Pending</span>
                <span className="dashboard__order-value">{formatNumber(summary.pendingPaymentOrders)}</span>
              </div>
            </div>

            {/* Order Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('order', 'all')}>
              <div className="dashboard__order-icon dashboard__order-icon--order">
                <FiPackage />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Order</span>
                <span className="dashboard__order-value">{formatNumber(summary.totalOrders)}</span>
              </div>
            </div>

            {/* Delay Order Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('delay', 'delayed')}>
              <div className="dashboard__order-icon dashboard__order-icon--delay">
                <FiAlertCircle />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Delay order</span>
                <span className="dashboard__order-value">{formatNumber(summary.delayedOrders)}</span>
              </div>
            </div>

            {/* Active Order Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('active', 'active')}>
              <div className="dashboard__order-icon dashboard__order-icon--active">
                <FiActivity />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Active order</span>
                <span className="dashboard__order-value">{formatNumber(summary.activeOrders)}</span>
              </div>
            </div>

            {/* Price Order Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('price', 'price')}>
              <div className="dashboard__order-icon dashboard__order-icon--price">
                <FiDollarSign />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Price order</span>
                <span className="dashboard__order-value">{formatNumber(summary.priceOrders)}</span>
              </div>
            </div>

            {/* Complete Order Card */}
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('complete', 'complete')}>
              <div className="dashboard__order-icon dashboard__order-icon--complete">
                <FiCheckCircle />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Complete order</span>
                <span className="dashboard__order-value">{formatNumber(summary.completedOrders)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="dashboard__customer-section">
          <div className="dashboard__customer-header">
            <h3>Customer</h3>
            <span className="dashboard__customer-total">{formatNumber(summary.totalCustomers)}</span>
          </div>
          
          <div className="dashboard__customer-cards">
            <div className="dashboard__customer-card">
              <div className="dashboard__customer-icon">
                <FiUsers />
              </div>
              <div className="dashboard__customer-info">
                <span className="dashboard__customer-label">Total Customers</span>
                <span className="dashboard__customer-value">{formatNumber(summary.totalCustomers)}</span>
              </div>
            </div>

            <div className="dashboard__customer-card">
              <div className="dashboard__customer-icon">
                <FiUser />
              </div>
              <div className="dashboard__customer-info">
                <span className="dashboard__customer-label">New Customers</span>
                <span className="dashboard__customer-value">{formatNumber(Math.floor(summary.totalCustomers * 0.2))}</span>
              </div>
            </div>

            <div className="dashboard__customer-card">
              <div className="dashboard__customer-icon">
                <FiActivity />
              </div>
              <div className="dashboard__customer-info">
                <span className="dashboard__customer-label">Active Customers</span>
                <span className="dashboard__customer-value">{formatNumber(Math.floor(summary.totalCustomers * 0.7))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Section */}
        <div className="dashboard__payment-section">
          <div className="dashboard__payment-header">
            <h3>Payment Status</h3>
          </div>
          
          <div className="dashboard__payment-cards">
            <div className="dashboard__payment-card dashboard__payment-card--pending" onClick={() => handleOrderCardClick('pending', 'pending_payment')}>
              <div className="dashboard__payment-icon">
                <FiAlertCircle />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Pending Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.pendingPaymentOrders)}</span>
              </div>
            </div>

            <div className="dashboard__payment-card dashboard__payment-card--partial" onClick={() => handleOrderCardClick('partial', 'partial_payment')}>
              <div className="dashboard__payment-icon">
                <FiClock />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Partial Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.partialPaymentOrders)}</span>
              </div>
            </div>

            <div className="dashboard__payment-card dashboard__payment-card--complete" onClick={() => handleOrderCardClick('complete', 'complete_payment')}>
              <div className="dashboard__payment-icon">
                <FiCheckCircle />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Complete Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.completePaymentOrders)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="dashboard__recent-orders">
          <div className="dashboard__section-header">
            <h3>Recent Orders</h3>
            <button onClick={() => navigate('/all-orders')} className="dashboard__view-all-btn">
              View All
            </button>
          </div>
          
          <div className="dashboard__table-wrapper">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                 </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    const paymentStatus = order.advancePayment >= order.finalTotal ? 'complete' : 
                                         order.advancePayment > 0 ? 'partial' : 'pending';
                    return (
                      <tr key={order._id} onClick={() => navigate(`/customer-orders/${order._id}`)}>
                        <td className="dashboard__table-order-id">{order.billNumber || order._id?.slice(-8) || 'N/A'}</td>
                        <td className="dashboard__table-customer">{order.customer?.name || 'N/A'}</td>
                        <td>{new Date(order.date || order.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="dashboard__table-amount">{formatCurrency(order.finalTotal || 0)}</td>
                        <td>
                          <span className={`dashboard__status-badge dashboard__status-badge--${paymentStatus}`}>
                            {paymentStatus === 'pending' ? 'Pending' : 
                             paymentStatus === 'partial' ? 'Partial' : 'Complete'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;