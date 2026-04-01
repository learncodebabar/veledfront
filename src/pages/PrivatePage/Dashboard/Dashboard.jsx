// src/pages/PrivatePage/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiUsers,
  FiCalendar, FiFilter, FiRefreshCw,
  FiPackage, FiClock,
  FiCheckCircle, FiAlertCircle, FiShoppingBag,
  FiUser, FiActivity, FiTruck, FiChevronDown,
  FiArrowLeft, FiArrowRight, FiDollarSign, FiBarChart2, FiPieChart
} from 'react-icons/fi';

import {
  BsCurrencyRupee, BsWallet2
} from 'react-icons/bs';

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';

import Sidebar from '../../../components/Sidebar/Sidebar';
import { getAllOrders } from '../../../api/orderApi';
import { getAllExpenses as getCustomerExpenses } from '../../../api/expenseApi';
import { getAllExpenses as getAdminExpenses } from '../../../api/adminexpenseApi';
import { getAllCustomers } from '../../../api/customerApi';
import { getAllJobs } from '../../../api/jobApi';
import { getAllAdminPayments } from '../../../api/adminPaymentApi';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filter state
  const [dateFilterType, setDateFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNumber());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // Chart data states
  const [orderTrendData, setOrderTrendData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState([]);
  
  // Available years
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [orders, setOrders] = useState([]);
  const [customerExpenses, setCustomerExpenses] = useState([]);
  const [adminExpenses, setAdminExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);

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
    completedOrdersPaymentPending: 0,
    delayedOrders: 0,
    activeOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0,
    pendingOrdersPaymentAmount: 0,
    inProgressOrdersPaymentAmount: 0,
    completedOrdersPaymentAmount: 0,
    pendingOrdersRemainingAmount: 0,
    inProgressOrdersRemainingAmount: 0,
    completedOrdersRemainingAmount: 0
  });

  // Enhanced colors for charts
  const CHART_COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec489a',
    cyan: '#06b6d4',
    indigo: '#6366f1'
  };

  const STATUS_COLORS = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    delayed: '#ef4444'
  };

  const PAYMENT_COLORS = {
    pending: '#f59e0b',
    partial: '#8b5cf6',
    paid: '#10b981'
  };

  function getCurrentWeekNumber() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
    return weekNumber;
  }

  function getWeeksInYear(year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const days = Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay()) / 7);
  }

  function getWeekDates(year, weekNumber) {
    const startDate = new Date(year, 0, 1);
    const dayOffset = startDate.getDay();
    const daysToAdd = (weekNumber - 1) * 7 - dayOffset;
    const weekStart = new Date(year, 0, 1 + daysToAdd);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  }

  const getDateRange = () => {
    let startDate, endDate;

    switch (dateFilterType) {
      case 'year':
        startDate = new Date(selectedYear, 0, 1);
        endDate = new Date(selectedYear, 11, 31);
        break;
      case 'month':
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
        break;
      case 'week':
        const { weekStart, weekEnd } = getWeekDates(selectedYear, selectedWeek);
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case 'day':
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(2000, 0, 1);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  const getDateRangeDisplay = () => {
    switch (dateFilterType) {
      case 'year':
        return `${selectedYear}`;
      case 'month':
        return `${months[selectedMonth]} ${selectedYear}`;
      case 'week':
        const { weekStart, weekEnd } = getWeekDates(selectedYear, selectedWeek);
        return `Week ${selectedWeek} (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})`;
      case 'day':
        return new Date(selectedDate).toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      default:
        return 'All Time';
    }
  };

  const navigatePrevious = () => {
    switch (dateFilterType) {
      case 'year':
        setSelectedYear(prev => prev - 1);
        break;
      case 'month':
        if (selectedMonth === 0) {
          setSelectedMonth(11);
          setSelectedYear(prev => prev - 1);
        } else {
          setSelectedMonth(prev => prev - 1);
        }
        break;
      case 'week':
        if (selectedWeek === 1) {
          setSelectedYear(prev => prev - 1);
          setSelectedWeek(getWeeksInYear(selectedYear - 1));
        } else {
          setSelectedWeek(prev => prev - 1);
        }
        break;
      case 'day':
        const prevDate = new Date(selectedDate);
        prevDate.setDate(prevDate.getDate() - 1);
        setSelectedDate(prevDate.toISOString().split('T')[0]);
        break;
    }
  };

  const navigateNext = () => {
    const today = new Date();
    
    switch (dateFilterType) {
      case 'year':
        if (selectedYear < today.getFullYear()) {
          setSelectedYear(prev => prev + 1);
        }
        break;
      case 'month':
        if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth()) {
          return;
        }
        if (selectedMonth === 11) {
          setSelectedMonth(0);
          setSelectedYear(prev => prev + 1);
        } else {
          setSelectedMonth(prev => prev + 1);
        }
        break;
      case 'week':
        const currentWeek = getCurrentWeekNumber();
        if (selectedYear === today.getFullYear() && selectedWeek === currentWeek) {
          return;
        }
        const weeksInYear = getWeeksInYear(selectedYear);
        if (selectedWeek === weeksInYear) {
          setSelectedYear(prev => prev + 1);
          setSelectedWeek(1);
        } else {
          setSelectedWeek(prev => prev + 1);
        }
        break;
      case 'day':
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const todayDate = new Date();
        if (nextDate <= todayDate) {
          setSelectedDate(nextDate.toISOString().split('T')[0]);
        }
        break;
    }
  };

  const filterByDateRange = (data) => {
    if (!data || !Array.isArray(data)) return [];
    const { startDate, endDate } = getDateRange();
    return data.filter(item => {
      if (!item) return false;
      const itemDate = new Date(item.date || item.createdAt || Date.now());
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilterType, selectedYear, selectedMonth, selectedWeek, selectedDate]);

  const formatCurrency = (amount) => {
    const numAmount = Number(amount || 0);
    return `Rs ${numAmount.toLocaleString('en-PK')}`;
  };

  const formatNumber = (num) => {
    return Number(num || 0).toLocaleString('en-PK');
  };

  const roundToTwoDecimals = (value) => {
    return Number((value).toFixed(2));
  };

  const handleOrderCardClick = (filterType, filterValue) => {
    navigate('/all-orders', {
      state: {
        orderFilter: filterType,
        filterValue: filterValue,
        fromDashboard: true
      }
    });
  };

  // Prepare chart data
  const prepareChartData = (ordersData) => {
    const filteredOrders = filterByDateRange(ordersData);
    
    // Order trend data (last 7 days)
    const ordersByDate = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = { count: 0, revenue: 0 };
      }
      ordersByDate[dateKey].count++;
      ordersByDate[dateKey].revenue += (order.finalTotal || 0);
    });

    const trendData = Object.keys(ordersByDate)
      .sort()
      .slice(-7)
      .map(date => ({
        date,
        orders: ordersByDate[date].count,
        revenue: ordersByDate[date].revenue
      }));

    setOrderTrendData(trendData);

    // Status distribution
    const statusCount = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      delayed: 0
    };
    
    filteredOrders.forEach(order => {
      const status = order.status || 'pending';
      if (statusCount[status] !== undefined) {
        statusCount[status]++;
      }
      if (order.dueDate && new Date(order.dueDate) < new Date() && status !== 'completed') {
        statusCount.delayed++;
      }
    });

    setStatusDistribution([
      { name: 'Pending', value: statusCount.pending, color: CHART_COLORS.warning },
      { name: 'In Progress', value: statusCount['in-progress'], color: CHART_COLORS.primary },
      { name: 'Completed', value: statusCount.completed, color: CHART_COLORS.success },
      { name: 'Delayed', value: statusCount.delayed, color: CHART_COLORS.danger }
    ].filter(item => item.value > 0));

    // Payment distribution
    const paymentCount = {
      pending: 0,
      partial: 0,
      paid: 0
    };
    
    filteredOrders.forEach(order => {
      const paymentStatus = order.paymentStatus || 'pending';
      paymentCount[paymentStatus]++;
    });

    setPaymentDistribution([
      { name: 'Pending', value: paymentCount.pending, color: CHART_COLORS.warning },
      { name: 'Partial', value: paymentCount.partial, color: CHART_COLORS.purple },
      { name: 'Paid', value: paymentCount.paid, color: CHART_COLORS.success }
    ].filter(item => item.value > 0));

    // Monthly performance data
    const monthlyData = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: months[date.getMonth()].slice(0, 3), year: date.getFullYear(), revenue: 0, orders: 0 };
      }
      monthlyData[monthKey].revenue += (order.finalTotal || 0);
      monthlyData[monthKey].orders++;
    });

    const monthlyArray = Object.keys(monthlyData)
      .sort()
      .slice(-6)
      .map(key => monthlyData[key]);
    
    setMonthlyPerformance(monthlyArray);

    // Revenue data for area chart
    const revenueByDate = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.date || order.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = 0;
      }
      revenueByDate[dateKey] += (order.finalTotal || 0);
    });

    const revenueArray = Object.keys(revenueByDate)
      .sort()
      .slice(-7)
      .map(date => ({
        date,
        revenue: revenueByDate[date]
      }));
    
    setRevenueData(revenueArray);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        ordersRes,
        customerExpensesRes,
        adminExpensesRes,
        customersRes,
        jobsRes,
        adminPaymentsRes
      ] = await Promise.all([
        getAllOrders(),
        getCustomerExpenses({ limit: 1000 }),
        getAdminExpenses({ limit: 1000 }),
        getAllCustomers(),
        getAllJobs(),
        getAllAdminPayments({ limit: 1000 })
      ]);

      const ordersData = ordersRes.data?.data || ordersRes.data || ordersRes || [];
      setOrders(ordersData);

      prepareChartData(ordersData);

      const customerExpensesData = customerExpensesRes?.data?.data || customerExpensesRes?.data || customerExpensesRes || [];
      setCustomerExpenses(customerExpensesData);

      const adminExpensesData = adminExpensesRes?.data?.data || adminExpensesRes?.data || adminExpensesRes || [];
      setAdminExpenses(adminExpensesData);

      const customersData = customersRes.data?.data || customersRes.data || customersRes || [];
      setCustomers(customersData);

      const jobsData = jobsRes.data?.data || jobsRes.data || jobsRes || [];
      setJobs(jobsData);

      const adminPaymentsData = adminPaymentsRes?.data?.data || adminPaymentsRes?.data || adminPaymentsRes || [];
      setAdminPayments(adminPaymentsData);

      const allExpenses = [...customerExpensesData, ...adminExpensesData];

      const newSummary = calculateSummaries(
        ordersData,
        allExpenses,
        customersData,
        jobsData,
        adminPaymentsData
      );

      setSummary(newSummary);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (ordersData, allExpenses, customersData, jobsData, adminPaymentsData) => {
    const filteredOrders = filterByDateRange(ordersData);
    const filteredAllExpenses = filterByDateRange(allExpenses);
    const filteredAdminPayments = filterByDateRange(adminPaymentsData);

    const totalAdvance = filteredOrders.reduce((sum, order) => {
      return sum + roundToTwoDecimals(order.advancePayment || 0);
    }, 0);

    const totalEmbeddedPayments = filteredOrders.reduce((sum, order) => {
      const orderPaymentsTotal = (order.payments || []).reduce((pSum, p) => {
        return pSum + roundToTwoDecimals(p.amount || 0);
      }, 0);
      return sum + orderPaymentsTotal;
    }, 0);

    const totalAdminPaymentsAmount = filteredAdminPayments.reduce((sum, payment) => {
      return sum + roundToTwoDecimals(payment.amount || 0);
    }, 0);

    const totalRevenue = roundToTwoDecimals(totalAdvance + totalEmbeddedPayments + totalAdminPaymentsAmount);
    const totalExpenses = roundToTwoDecimals(filteredAllExpenses.reduce((sum, expense) => {
      return sum + roundToTwoDecimals(expense.amount || 0);
    }, 0));

    let pendingPayment = 0;
    let partialPayment = 0;
    let completePayment = 0;
    let completedOrdersPaymentPending = 0;

    let delayedOrders = 0;
    let activeOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    let inProgressOrders = 0;

    let pendingOrdersPaymentAmount = 0;
    let inProgressOrdersPaymentAmount = 0;
    let completedOrdersPaymentAmount = 0;
    let pendingOrdersRemainingAmount = 0;
    let inProgressOrdersRemainingAmount = 0;
    let completedOrdersRemainingAmount = 0;

    const today = new Date();

    filteredOrders.forEach(order => {
      const orderStatus = order.status || 'pending';
      const paymentStatus = order.paymentStatus || 'pending';
      const finalTotal = order.finalTotal || 0;
      const advancePayment = order.advancePayment || 0;
      const paymentsTotal = (order.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalReceived = advancePayment + paymentsTotal;
      const remainingBalance = finalTotal - totalReceived;

      if (paymentStatus === 'paid') {
        completePayment++;
      } else if (paymentStatus === 'partial') {
        partialPayment++;
      } else {
        pendingPayment++;
      }

      if (orderStatus === 'pending') {
        pendingOrdersPaymentAmount += totalReceived;
        pendingOrdersRemainingAmount += remainingBalance;
        pendingOrders++;
      } else if (orderStatus === 'in-progress') {
        inProgressOrdersPaymentAmount += totalReceived;
        inProgressOrdersRemainingAmount += remainingBalance;
        inProgressOrders++;
        activeOrders++;
      } else if (orderStatus === 'completed') {
        completedOrdersPaymentAmount += totalReceived;
        completedOrdersRemainingAmount += remainingBalance;
        completedOrders++;
      }

      if (orderStatus === 'completed' && paymentStatus !== 'paid') {
        completedOrdersPaymentPending++;
      }

      if (order.dueDate && new Date(order.dueDate) < today && orderStatus !== 'completed') {
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
      completedOrdersPaymentPending,
      delayedOrders,
      activeOrders,
      pendingOrders,
      completedOrders,
      inProgressOrders,
      pendingOrdersPaymentAmount,
      inProgressOrdersPaymentAmount,
      completedOrdersPaymentAmount,
      pendingOrdersRemainingAmount,
      inProgressOrdersRemainingAmount,
      completedOrdersRemainingAmount
    };
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Enhanced Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="dashboard__chart-tooltip">
          <p className="dashboard__chart-tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="dashboard__chart-tooltip-item" style={{ color: entry.color }}>
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
    <div className="dashboard__container sideber-container-Mobile">
      <Sidebar />

      <div className="dashboard__content">
        <div className="dashboard__header">
          <div className="dashboard__header-left">
            <h1 className="dashboard__title">Dashboard</h1>
            <p className="dashboard__subtitle">Welcome back, Admin</p>
          </div>

          <div className="dashboard__header-right">
            <div className="dashboard__filter-container">
              <button 
                className="dashboard__filter-trigger"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              >
                <FiCalendar />
                <span>{getDateRangeDisplay()}</span>
                <FiChevronDown className={isFilterDropdownOpen ? 'rotate' : ''} />
              </button>
              
              {isFilterDropdownOpen && (
                <div className="dashboard__filter-dropdown">
                  <button 
                    className={`dashboard__filter-option ${dateFilterType === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setDateFilterType('all');
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    All Time
                  </button>
                  <button 
                    className={`dashboard__filter-option ${dateFilterType === 'year' ? 'active' : ''}`}
                    onClick={() => {
                      setDateFilterType('year');
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    Year
                  </button>
                  <button 
                    className={`dashboard__filter-option ${dateFilterType === 'month' ? 'active' : ''}`}
                    onClick={() => {
                      setDateFilterType('month');
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    Month
                  </button>
                  <button 
                    className={`dashboard__filter-option ${dateFilterType === 'week' ? 'active' : ''}`}
                    onClick={() => {
                      setDateFilterType('week');
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    Week
                  </button>
                  <button 
                    className={`dashboard__filter-option ${dateFilterType === 'day' ? 'active' : ''}`}
                    onClick={() => {
                      setDateFilterType('day');
                      setIsFilterDropdownOpen(false);
                    }}
                  >
                    Day
                  </button>
                </div>
              )}
            </div>

            {dateFilterType !== 'all' && (
              <div className="dashboard__date-navigation">
                <button onClick={navigatePrevious} className="dashboard__nav-btn">
                  <FiArrowLeft />
                </button>
                
                {dateFilterType === 'year' && (
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="dashboard__year-select"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}
                
                {dateFilterType === 'month' && (
                  <>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="dashboard__year-select"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="dashboard__month-select"
                    >
                      {months.map((month, index) => (
                        <option key={month} value={index}>{month}</option>
                      ))}
                    </select>
                  </>
                )}
                
                {dateFilterType === 'week' && (
                  <>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="dashboard__year-select"
                    >
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <select 
                      value={selectedWeek} 
                      onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                      className="dashboard__week-select"
                    >
                      {Array.from({ length: getWeeksInYear(selectedYear) }, (_, i) => i + 1).map(week => (
                        <option key={week} value={week}>Week {week}</option>
                      ))}
                    </select>
                  </>
                )}
                
                {dateFilterType === 'day' && (
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="dashboard__date-picker"
                  />
                )}
                
                <button onClick={navigateNext} className="dashboard__nav-btn">
                  <FiArrowRight />
                </button>
              </div>
            )}
            
            <button onClick={handleRefresh} className="dashboard__refresh-btn">
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>

        {/* Financial Cards */}
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

        {/* Order Related Section */}
        <div className="dashboard__orders-section">
          <div className="dashboard__orders-header">
            <h3>Order Related</h3>
            <span className="dashboard__orders-total">Total: {formatNumber(summary.totalOrders)}</span>
          </div>

          <div className="dashboard__orders-grid">
            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'all')}>
              <div className="dashboard__order-icon dashboard__order-icon--ordered">
                <FiShoppingBag />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Total Orders</span>
                <span className="dashboard__order-value">{formatNumber(summary.totalOrders)}</span>
              </div>
            </div>

            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'pending')}>
              <div className="dashboard__order-icon dashboard__order-icon--pending">
                <FiClock />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Pending Orders</span>
                <span className="dashboard__order-value">{formatNumber(summary.pendingOrders)}</span>
              </div>
            </div>

            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'in-progress')}>
              <div className="dashboard__order-icon dashboard__order-icon--active">
                <FiActivity />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">In Progress</span>
                <span className="dashboard__order-value">{formatNumber(summary.inProgressOrders)}</span>
              </div>
            </div>

            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'completed')}>
              <div className="dashboard__order-icon dashboard__order-icon--complete">
                <FiCheckCircle />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Completed Orders</span>
                <span className="dashboard__order-value">{formatNumber(summary.completedOrders)}</span>
              </div>
            </div>

            <div className="dashboard__order-card" onClick={() => handleOrderCardClick('status', 'delayed')}>
              <div className="dashboard__order-icon dashboard__order-icon--delay">
                <FiAlertCircle />
              </div>
              <div className="dashboard__order-info">
                <span className="dashboard__order-label">Delayed Orders</span>
                <span className="dashboard__order-value">{formatNumber(summary.delayedOrders)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard__payment-amount-section">
            <div className="dashboard__payment-amount-header">
              <h4>Payments by Order Status</h4>
            </div>
            <div className="dashboard__payment-amount-grid">
              <div className="dashboard__payment-amount-card pending-status">
                <div className="payment-amount-icon">
                  <FiDollarSign />
                </div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Pending Orders - Received</span>
                  <span className="payment-amount-value">{formatCurrency(summary.pendingOrdersPaymentAmount)}</span>
                  <span className="payment-amount-sub">Remaining: {formatCurrency(summary.pendingOrdersRemainingAmount)}</span>
                </div>
              </div>

              <div className="dashboard__payment-amount-card progress-status">
                <div className="payment-amount-icon">
                  <FiActivity />
                </div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">In Progress - Received</span>
                  <span className="payment-amount-value">{formatCurrency(summary.inProgressOrdersPaymentAmount)}</span>
                  <span className="payment-amount-sub">Remaining: {formatCurrency(summary.inProgressOrdersRemainingAmount)}</span>
                </div>
              </div>

              <div className="dashboard__payment-amount-card completed-status">
                <div className="payment-amount-icon">
                  <FiCheckCircle />
                </div>
                <div className="payment-amount-info">
                  <span className="payment-amount-label">Completed Orders - Received</span>
                  <span className="payment-amount-value">{formatCurrency(summary.completedOrdersPaymentAmount)}</span>
                  <span className="payment-amount-sub">Remaining: {formatCurrency(summary.completedOrdersRemainingAmount)}</span>
                </div>
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
            <div
              className="dashboard__payment-card dashboard__payment-card--pending"
              onClick={() => handleOrderCardClick('payment', 'pending_payment')}
            >
              <div className="dashboard__payment-icon">
                <FiAlertCircle />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Pending Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.pendingPaymentOrders)}</span>
              </div>
            </div>

            <div
              className="dashboard__payment-card dashboard__payment-card--partial"
              onClick={() => handleOrderCardClick('payment', 'partial_payment')}
            >
              <div className="dashboard__payment-icon">
                <FiClock />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Partial Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.partialPaymentOrders)}</span>
              </div>
            </div>

            <div
              className="dashboard__payment-card dashboard__payment-card--complete"
              onClick={() => handleOrderCardClick('payment', 'complete_payment')}
            >
              <div className="dashboard__payment-icon">
                <FiCheckCircle />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Complete Payment</span>
                <span className="dashboard__payment-value">{formatNumber(summary.completePaymentOrders)}</span>
              </div>
            </div>

            <div
              className="dashboard__payment-card dashboard__payment-card--warning"
              onClick={() => handleOrderCardClick('payment', 'completed_payment_pending')}
            >
              <div className="dashboard__payment-icon">
                <FiTruck />
              </div>
              <div className="dashboard__payment-info">
                <span className="dashboard__payment-label">Completed Order - Payment Pending</span>
                <span className="dashboard__payment-value">{formatNumber(summary.completedOrdersPaymentPending)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="dashboard__customer-section">
          <div className="dashboard__customer-header">
            <h3>Customer</h3>
            <span className="dashboard__customer-total">Total: {formatNumber(summary.totalCustomers)}</span>
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
                <span className="dashboard__customer-label">Active Customers</span>
                <span className="dashboard__customer-value">{formatNumber(Math.floor(summary.totalCustomers * 0.7))}</span>
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
                  <th>Order Status</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    const paymentStatus = order.paymentStatus || 'pending';
                    const orderStatus = order.status || 'pending';

                    return (
                      <tr key={order._id} onClick={() => navigate(`/customer-orders/${order._id}`)} style={{ cursor: 'pointer' }}>
                        <td className="dashboard__table-order-id">{order.billNumber || order._id?.slice(-8) || 'N/A'}</td>
                        <td className="dashboard__table-customer">{order.customer?.name || 'N/A'}</td>
                        <td>{new Date(order.date || order.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="dashboard__table-amount">{formatCurrency(order.finalTotal || 0)}</td>
                        <td>
                          <span className={`dashboard__status-badge dashboard__status-badge--${orderStatus}`}>
                            {orderStatus === 'pending' ? 'Pending' :
                              orderStatus === 'in-progress' ? 'In Progress' : 'Completed'}
                          </span>
                        </td>
                        <td>
                          <span className={`dashboard__status-badge dashboard__status-badge--${paymentStatus}`}>
                            {paymentStatus === 'pending' ? 'Pending' :
                              paymentStatus === 'partial' ? 'Partial' : 'Paid'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section - Moved to Bottom */}
        <div className="dashboard__charts-section">
          <div className="dashboard__section-header">
            <h3>Analytics & Reports</h3>
            <span className="dashboard__insights-badge">Real-time Insights</span>
          </div>

          <div className="dashboard__charts-grid">
            {/* Order Trend Chart */}
            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                  <FiBarChart2 />
                </div>
                <div>
                  <h3>Order & Revenue Trend</h3>
                  <p>Last 7 days performance</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={orderTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke={CHART_COLORS.primary} strokeWidth={2} name="Orders" dot={{ fill: CHART_COLORS.primary, r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke={CHART_COLORS.success} strokeWidth={2} name="Revenue" dot={{ fill: CHART_COLORS.success, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Trend Area Chart */}
            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <FiTrendingUp />
                </div>
                <div>
                  <h3>Revenue Trend</h3>
                  <p>Daily revenue tracking</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Performance Bar Chart */}
            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <FiBarChart2 />
                </div>
                <div>
                  <h3>Monthly Performance</h3>
                  <p>Last 6 months overview</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="orders" fill={CHART_COLORS.primary} name="Orders" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill={CHART_COLORS.success} name="Revenue" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Distribution */}
            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <FiPieChart />
                </div>
                <div>
                  <h3>Order Status Distribution</h3>
                  <p>Current order breakdown</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Status Distribution */}
            <div className="dashboard__chart-card">
              <div className="dashboard__chart-header">
                <div className="chart-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ec489a, #db2777)' }}>
                  <FiPieChart />
                </div>
                <div>
                  <h3>Payment Status Distribution</h3>
                  <p>Payment collection status</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;