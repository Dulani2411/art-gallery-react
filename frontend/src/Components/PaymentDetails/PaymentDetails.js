import React, { useState, useEffect } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import "./PaymentDetails.css";
import { FaTrash, FaEye, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaChartBar } from "react-icons/fa";

function PaymentDetails() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState({
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    completedValue: 0,
    pendingValue: 0,
    failedValue: 0
  });
  
  // Fetch all payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Calculate stats whenever payments or filters change
  useEffect(() => {
    calculateStats(filteredPayments);
  }, [payments, searchTerm, statusFilter]);

  const calculateStats = (paymentList) => {
    let totalItems = 0;
    let totalQuantity = 0;
    let totalValue = 0;
    let completedValue = 0;
    let pendingValue = 0;
    let failedValue = 0;

    paymentList.forEach(payment => {
      // Count unique artworks
      if (payment.artworks && payment.artworks.length) {
        totalItems += payment.artworks.length;
        
        // Sum quantities
        payment.artworks.forEach(item => {
          const quantity = item.quantity || 1;
          totalQuantity += quantity;
        });
      }

      // Sum values
      const paymentAmount = payment.totalAmount || 0;
      totalValue += paymentAmount;

      // Track value by status
      switch (payment.paymentStatus) {
        case 'completed':
          completedValue += paymentAmount;
          break;
        case 'pending':
          pendingValue += paymentAmount;
          break;
        case 'failed':
          failedValue += paymentAmount;
          break;
        default:
          break;
      }
    });

    setStatsData({
      totalItems,
      totalQuantity,
      totalValue,
      completedValue,
      pendingValue,
      failedValue
    });
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Try the original URL first
      const response = await axios.get("http://localhost:5000/payment");
      console.log("Fetched payments:", response.data);
      
      if (response.data) {
        // Handle different API response formats
        if (response.data.success && Array.isArray(response.data.data)) {
          // Format: { success: true, data: [...] }
          setPayments(response.data.data);
        } else if (Array.isArray(response.data)) {
          // Format: Direct array
          setPayments(response.data);
        } else if (response.data.payments && Array.isArray(response.data.payments)) {
          // Format: { payments: [...] }
          setPayments(response.data.payments);
        } else {
          console.error("Unexpected API response format:", response.data);
          throw new Error("Unexpected API response format");
        }
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.response?.data?.message || err.message || "Failed to load payment details");
      
      // More descriptive error for API issues
      if (err.response && err.response.status === 404) {
        setError("API endpoint not found (404). Please verify your backend server is running and the payment endpoint is correctly configured.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      const response = await axios.delete(`http://localhost:5000/payment/${paymentId}`);
      
      if (response.data && response.data.success) {
        // Remove the deleted payment from state
        setPayments(payments.filter(payment => payment._id !== paymentId));
        setShowModal(false);
        alert("Payment deleted successfully");
      } else {
        throw new Error("Failed to delete payment");
      }
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete payment");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle status change
const handleStatusChange = async (paymentId, newStatus) => {
  setStatusUpdateLoading(true);
  try {
    // Use the correct field name and endpoint directly
    const response = await axios.patch(`http://localhost:5000/payment/${paymentId}/status`, {
      paymentStatus: newStatus  // Changed from 'status' to 'paymentStatus'
    });
    
    if (response.data && (response.data.success || response.data.status === "success")) {
      // Update the payment status in the state
      setPayments(payments.map(payment => 
        payment._id === paymentId ? { ...payment, paymentStatus: newStatus } : payment
      ));
      
      if (selectedPayment && selectedPayment._id === paymentId) {
        setSelectedPayment({ ...selectedPayment, paymentStatus: newStatus });
      }
      
      alert(`Payment status updated to ${newStatus}`);
    } else {
      throw new Error("Failed to update payment status");
    }
  } catch (err) {
    console.error("Error updating payment status:", err);
    
    // More descriptive error message with debugging info
    const errorDetails = err.response ? 
      `Status: ${err.response.status}, Message: ${JSON.stringify(err.response.data)}` : 
      err.message;
    
    console.log("Error details:", errorDetails);
    
    alert(err.response?.data?.message || err.message || "Failed to update payment status");
  } finally {
    setStatusUpdateLoading(false);
  }
};
  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  // Filter payments based on search term and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      payment.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status icon based on payment status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'failed':
        return <FaTimesCircle className="status-icon failed" />;
      case 'pending':
      default:
        return <FaHourglassHalf className="status-icon pending" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  // Get percentage of total
  const getPercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="payment-details-container">
      <Nav />
      <div className="admin-header">
        <h1>Payment Details</h1>
        <p>Administrator Dashboard</p>
      </div>

      <div className="main-content">
        {error && <div className="error-message">{error}</div>}

        {/* Payment Statistics Section */}
        <div className="payment-stats-container">
          <div className="stats-header">
            <h2>Payment Statistics</h2>
            <button 
              className="toggle-stats-btn" 
              onClick={() => setShowStats(!showStats)}
            >
              <FaChartBar /> {showStats ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="stats-summary">
            <div className="stat-box">
              <h3>Total Orders</h3>
              <p className="stat-value">{filteredPayments.length}</p>
            </div>
            <div className="stat-box">
              <h3>Total Items</h3>
              <p className="stat-value">{statsData.totalItems}</p>
            </div>
            <div className="stat-box">
              <h3>Total Quantity</h3>
              <p className="stat-value">{statsData.totalQuantity}</p>
            </div>
            <div className="stat-box highlight">
              <h3>Total Value</h3>
              <p className="stat-value">{formatCurrency(statsData.totalValue)}</p>
            </div>
          </div>
          
          {showStats && (
            <div className="detailed-stats">
              <div className="stat-breakdown">
                <h3>Value by Status</h3>
                <div className="stat-breakdown-items">
                  <div className="stat-breakdown-item completed">
                    <div className="breakdown-label">
                      <FaCheckCircle /> Completed
                    </div>
                    <div className="breakdown-value">
                      {formatCurrency(statsData.completedValue)}
                      <span className="percentage">({getPercentage(statsData.completedValue, statsData.totalValue)}%)</span>
                    </div>
                  </div>
                  <div className="stat-breakdown-item pending">
                    <div className="breakdown-label">
                      <FaHourglassHalf /> Pending
                    </div>
                    <div className="breakdown-value">
                      {formatCurrency(statsData.pendingValue)}
                      <span className="percentage">({getPercentage(statsData.pendingValue, statsData.totalValue)}%)</span>
                    </div>
                  </div>
                  <div className="stat-breakdown-item failed">
                    <div className="breakdown-label">
                      <FaTimesCircle /> Failed
                    </div>
                    <div className="breakdown-value">
                      {formatCurrency(statsData.failedValue)}
                      <span className="percentage">({getPercentage(statsData.failedValue, statsData.totalValue)}%)</span>
                    </div>
                  </div>
                </div>
                
                {/* Visual representation of status breakdown */}
                <div className="status-bar">
                  <div 
                    className="status-segment completed" 
                    style={{ width: `${getPercentage(statsData.completedValue, statsData.totalValue)}%` }}
                    title={`Completed: ${formatCurrency(statsData.completedValue)}`}
                  ></div>
                  <div 
                    className="status-segment pending" 
                    style={{ width: `${getPercentage(statsData.pendingValue, statsData.totalValue)}%` }}
                    title={`Pending: ${formatCurrency(statsData.pendingValue)}`}
                  ></div>
                  <div 
                    className="status-segment failed" 
                    style={{ width: `${getPercentage(statsData.failedValue, statsData.totalValue)}%` }}
                    title={`Failed: ${formatCurrency(statsData.failedValue)}`}
                  ></div>
                </div>
              </div>
              
              <div className="order-averages">
                <div className="average-stat">
                  <h4>Average Order Value</h4>
                  <p>
                    {formatCurrency(filteredPayments.length ? statsData.totalValue / filteredPayments.length : 0)}
                  </p>
                </div>
                <div className="average-stat">
                  <h4>Average Items Per Order</h4>
                  <p>
                    {filteredPayments.length ? (statsData.totalItems / filteredPayments.length).toFixed(2) : 0}
                  </p>
                </div>
                <div className="average-stat">
                  <h4>Average Quantity Per Order</h4>
                  <p>
                    {filteredPayments.length ? (statsData.totalQuantity / filteredPayments.length).toFixed(2) : 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="filters">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, email or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="status-filter">
            <label>Filter by Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <button onClick={fetchPayments} className="refresh-btn">
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading payment details...</div>
        ) : (
          <>
            {filteredPayments.length === 0 ? (
              <div className="no-payments">No payments found</div>
            ) : (
              <div className="payments-table-container">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="payment-id">{payment._id.substring(0, 8)}...</td>
                        <td className="customer-info">
                          <div className="customer-name">{payment.name}</div>
                          <div className="customer-email">{payment.email}</div>
                        </td>
                        <td>{formatDate(payment.createdAt)}</td>
                        <td className="item-count">
                          {payment.artworks?.length || 0} {payment.artworks?.length === 1 ? 'item' : 'items'}
                          {payment.artworks && (
                            <span className="item-quantity">
                              (Qty: {payment.artworks.reduce((total, item) => total + (item.quantity || 1), 0)})
                            </span>
                          )}
                        </td>
                        <td className="payment-amount">{formatCurrency(payment.totalAmount || 0)}</td>
                        <td className="payment-status">
                          {getStatusIcon(payment.paymentStatus)}
                          <span className={`status-text ${payment.paymentStatus}`}>
                            {payment.paymentStatus?.charAt(0).toUpperCase() + payment.paymentStatus?.slice(1)}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            onClick={() => openPaymentDetails(payment)} 
                            className="view-btn"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {payment.paymentStatus === 'pending' && (
                            <button 
                              onClick={() => handleStatusChange(payment._id, 'completed')} 
                              className="approve-btn"
                              title="Mark as Completed"
                              disabled={statusUpdateLoading}
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleDelete(payment._id)} 
                            className="delete-btn"
                            title="Delete Payment"
                            disabled={deleteLoading}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Payment Details Modal */}
        {showModal && selectedPayment && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Payment Details</h2>
                <button onClick={closeModal} className="close-btn">&times;</button>
              </div>
              
              <div className="modal-body">
                <div className="payment-info-section">
                  <h3>Customer Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedPayment.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{selectedPayment.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Contact Number:</span>
                      <span className="info-value">{selectedPayment.contactNumber}</span>
                    </div>
                    <div className="info-item full-width">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{selectedPayment.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="payment-info-section">
                  <h3>Payment Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Payment ID:</span>
                      <span className="info-value">{selectedPayment._id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{formatDate(selectedPayment.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Amount:</span>
                      <span className="info-value">{formatCurrency(selectedPayment.totalAmount || 0)}</span>
                    </div>
                    <div className="info-item status-change-container">
                      <span className="info-label">Status:</span>
                      <div className="status-change-controls">
                        <span className={`current-status status-text ${selectedPayment.paymentStatus}`}>
                          {getStatusIcon(selectedPayment.paymentStatus)}
                          {selectedPayment.paymentStatus?.charAt(0).toUpperCase() + selectedPayment.paymentStatus?.slice(1)}
                        </span>
                        
                        {selectedPayment.paymentStatus !== 'completed' && (
                          <button 
                            onClick={() => handleStatusChange(selectedPayment._id, 'completed')} 
                            className="status-change-btn complete-btn"
                            disabled={statusUpdateLoading}
                          >
                            {statusUpdateLoading ? "Updating..." : "Mark as Completed"}
                          </button>
                        )}
                        
                        {selectedPayment.paymentStatus !== 'failed' && (
                          <button 
                            onClick={() => handleStatusChange(selectedPayment._id, 'failed')} 
                            className="status-change-btn fail-btn"
                            disabled={statusUpdateLoading}
                          >
                            {statusUpdateLoading ? "Updating..." : "Mark as Failed"}
                          </button>
                        )}
                        
                        {selectedPayment.paymentStatus !== 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(selectedPayment._id, 'pending')} 
                            className="status-change-btn pending-btn"
                            disabled={statusUpdateLoading}
                          >
                            {statusUpdateLoading ? "Updating..." : "Mark as Pending"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="order-summary-section">
                  <h3>Order Summary</h3>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Total Items:</span>
                      <span>{selectedPayment.artworks?.length || 0}</span>
                    </div>
                    <div className="summary-row">
                      <span>Total Quantity:</span>
                      <span>
                        {selectedPayment.artworks?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0}
                      </span>
                    </div>
                    <div className="summary-row subtotal">
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(
                          selectedPayment.artworks?.reduce((sum, item) => {
                            const price = item.artworkId?.price || 0;
                            const quantity = item.quantity || 1;
                            return sum + (price * quantity);
                          }, 0) || 0
                        )}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping Fee:</span>
                      <span>{formatCurrency(selectedPayment.shippingFee || 0)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedPayment.tax || 0)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Discount:</span>
                      <span>-{formatCurrency(selectedPayment.discount || 0)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total Amount:</span>
                      <span>{formatCurrency(selectedPayment.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="payment-proof-section">
                  <h3>Payment Proof</h3>
                  <div className="payment-proof-image">
                    {selectedPayment.image ? (
                      <img src={selectedPayment.image} alt="Payment Proof" />
                    ) : (
                      <p>No payment proof image available</p>
                    )}
                  </div>
                </div>
                
                <div className="ordered-items-section">
                  <h3>Ordered Items</h3>
                  <div className="ordered-items">
                    {selectedPayment.artworks && selectedPayment.artworks.length > 0 ? (
                      selectedPayment.artworks.map((item, index) => (
                        <div key={index} className="ordered-item">
                          <div className="item-details">
                            {item.artworkId ? (
                              <>
                                <h4>{item.artworkId.title || item.artworkId.artType || "Unknown Artwork"}</h4>
                                <p>Artist: {item.artworkId.artistName || "Unknown Artist"}</p>
                                <p>Unit Price: {formatCurrency(item.artworkId.price || 0)}</p>
                                <p>Quantity: {item.quantity || 1}</p>
                                <p className="item-total">Item Total: {formatCurrency((item.artworkId.price || 0) * (item.quantity || 1))}</p>
                              </>
                            ) : (
                              <h4>Item details unavailable</h4>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No items in this order</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => handleDelete(selectedPayment._id)} 
                  className="delete-modal-btn"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete Payment"}
                </button>
                <button onClick={closeModal} className="close-modal-btn">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentDetails;