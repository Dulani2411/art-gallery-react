import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./PaymentConfirmation.css";

function PaymentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, totalAmount } = location.state || {};

  useEffect(() => {
    if (!paymentId) {
      navigate("/");
    }
  }, [paymentId, navigate]);

  if (!paymentId) {
    return null;
  }

  return (
    <>
      <Nav />
      <div className="confirmation-container">
        <div className="confirmation-card">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
          <h2 style={{ color: "#003366", fontWeight: "800" }}>Payment Successful!</h2>
          <div className="confirmation-details">
            <p>Thank you for your purchase!</p>
            <p>Your payment has been successfully processed.</p>
            <p className="payment-id">Payment ID: {paymentId}</p>
            <p className="amount">
              Amount Paid: Rs.{" "}
              {Number(totalAmount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="confirmation-message">
            <p>
              We have received your payment proof and will process your order shortly.
              You will receive an email confirmation with the details of your purchase.
            </p>
          </div>

          <div
  className="receipt-notification"
  style={{ color: "#003366", fontWeight: "600" }}
>
  A receipt has been sent to your email.
</div>

          <div className="action-buttons">
            <button className="primary-button" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default PaymentConfirmation;
