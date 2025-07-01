import express from 'express';
import paymentController from '../Controllers/paymentControllers.js';

const router = express.Router();

// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Create new payment
router.post('/', paymentController.createPayment);

// Image upload for payment - FIXED endpoint URL
router.post('/upload-image', paymentController.upload.single('image'), paymentController.handlePaymentImageUpload);

// Update payment
router.put('/:id', paymentController.updatePayment);

// Update payment status
router.patch('/:id/status', paymentController.updatePaymentStatus);

// Delete payment
router.delete('/:id', paymentController.deletePayment);

export default router;