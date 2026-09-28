const express = require('express');
const router = express.Router();
const { createPayment, getPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('customer', 'admin'), createPayment);
router.get('/', protect, getPayments);

module.exports = router;
