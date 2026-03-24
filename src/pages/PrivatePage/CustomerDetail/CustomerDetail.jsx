import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUserLarge } from "react-icons/fa6";

import "./CustomerDetail.css";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getCustomerById } from "../../../api/customerApi";

const CustomerDetail = () => {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer data with jobs included
      const response = await getCustomerById(id);
      console.log('Customer Detail Response:', response);
      
      // Handle response based on structure
      if (response.success) {
        // New response structure with success flag
        setCustomer(response.customer);
        setJobs(response.jobs || []);
      } else if (response.customer) {
        // Response with customer and jobs but no success flag
        setCustomer(response.customer);
        setJobs(response.jobs || []);
      } else {
        // Direct customer object
        setCustomer(response);
        setJobs([]);
      }
      
    } catch (err) {
      console.error("Error fetching customer data:", err);
      
      // Handle different error types
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 404) {
        setError("Customer not found.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch customer data");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
    return `Rs ${Number(amount).toLocaleString("en-PK")}`;
  };

  // Check if job has any estimated amounts
  const hasEstimatedAmounts = (job) => {
    return job.estimatedAmounts && (
      job.estimatedAmounts.low || 
      job.estimatedAmounts.medium || 
      job.estimatedAmounts.high
    );
  };

  // Calculate work subtotal
  const calculateWorkSubtotal = (work) => {
    if (!work.materials || work.materials.length === 0) return 0;
    
    const materialsTotal = work.materials.reduce(
      (sum, m) => sum + (m.total || 0),
      0
    );
    
    return materialsTotal * (work.qty || 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="main-container-CustomerDetail">
        <Sidebar />
        <div className="content-wrapper-CustomerDetail loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading Customer Details...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="main-container-CustomerDetail sideber-container-Mobile">
        <Sidebar />
        <div className="content-wrapper-CustomerDetail error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchCustomerData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Customer not found state
  if (!customer) {
    return (
      <div className="main-container-CustomerDetail">
        <Sidebar />
        <div className="content-wrapper-CustomerDetail error-container">
          <h2>Customer not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container-CustomerDetail">
      <Sidebar />
      
      {/* Main Content */}
      <div className="content-wrapper-CustomerDetail">
        {/* Customer Info Card */}
        <div className="customer-info-card">
          <div className="customer-info-header">
            <span className="customer-icon"><FaUserLarge /></span>
            <h2>{customer.name || "Unnamed Customer"}</h2>
          </div>
          <div className="customer-info-body">
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{customer.phone || "Not provided"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">
                {customer.address || "Not provided"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Customer ID:</span>
              <span className="info-value">{customer._id || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="projects-section">
          <div className="projects-header">
            <h2>Projects / Works</h2>
            {jobs.length > 0 && (
              <span className="projects-count">{jobs.length} project{jobs.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="no-projects">
              <p>No work found for this customer</p>
            </div>
          ) : (
            jobs.map((job, jobIndex) => (
              <div key={job._id || jobIndex} className="job-card">
                <div className="job-header">
                  <div className="job-title">
                    <h3>Bill #{job.billNumber || job._id?.slice(-6) || 'N/A'}</h3>
                  </div>
                  <div className="job-date">
                    <span>{job.date ? new Date(job.date).toLocaleDateString() : 'Date N/A'}</span>
                  </div>
                </div>

                {/* Estimated Amounts Section */}
                {hasEstimatedAmounts(job) && (
                  <div className="estimated-amounts-section">
                    <h4>Estimated Costs</h4>
                    <div className="estimated-amounts-grid">
                      {job.estimatedAmounts.low && (
                        <div className="estimate-item low">
                          <span className="estimate-label">Low Estimate</span>
                          <span className="estimate-value">{formatCurrency(job.estimatedAmounts.low)}</span>
                        </div>
                      )}
                      {job.estimatedAmounts.medium && (
                        <div className="estimate-item medium">
                          <span className="estimate-label">Medium Estimate</span>
                          <span className="estimate-value">{formatCurrency(job.estimatedAmounts.medium)}</span>
                        </div>
                      )}
                      {job.estimatedAmounts.high && (
                        <div className="estimate-item high">
                          <span className="estimate-label">High Estimate</span>
                          <span className="estimate-value">{formatCurrency(job.estimatedAmounts.high)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="works-list">
                  {job.works && job.works.length > 0 ? (
                    job.works.map((work, workIndex) => (
                      <div key={workIndex} className="work-item">
                        <div className="work-header">
                          <div className="work-title">
                            <h4>{work.name || 'Unnamed Work'}</h4>
                          </div>
                          <div className="work-quantity">
                            <span>Quantity:</span>
                            <span className="quantity-badge">{work.qty || 1}</span>
                          </div>
                        </div>

                        {work.materials && work.materials.length > 0 ? (
                          <div className="materials-section">
                            <div className="materials-header">
                              <h5>Materials Used</h5>
                            </div>

                            <table className="materials-table">
                              <thead>
                                <tr>
                                  <th>Material Name</th>
                                  <th>Quantity</th>
                                  <th>Rate</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {work.materials.map((mat, matIndex) => (
                                  <tr key={matIndex}>
                                    <td>{mat.name || 'N/A'}</td>
                                    <td>{mat.qty || 0}</td>
                                    <td>{formatCurrency(mat.rate || 0)}</td>
                                    <td className="total-column">
                                      {formatCurrency(mat.total || 0)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className="work-subtotal">
                              <span>Work Subtotal:</span>
                              <span className="subtotal-amount">
                                {formatCurrency(calculateWorkSubtotal(work))}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="no-materials">
                            <p>No materials added for this work</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-materials">
                      <p>No works found for this job</p>
                    </div>
                  )}
                </div>

                <div className="job-total">
                  <div className="total-row">
                    <span>Grand Total:</span>
                    <span className="grand-total-amount">
                      {formatCurrency(job.total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;