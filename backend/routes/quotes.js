const express = require('express');
const router = express.Router();
const { createQuote, getQuotes, getQuote } = require('../controllers/quoteController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('customer', 'agent', 'admin'), createQuote);
router.get('/', authorize('customer', 'agent', 'admin', 'adjuster'), getQuotes);
router.get('/:id', authorize('customer', 'agent', 'admin', 'adjuster'), getQuote);

module.exports = router;
