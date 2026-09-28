const express = require('express');
const router = express.Router();
const { createPolicy, getPolicies, getPolicy, updatePolicy } = require('../controllers/policyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('customer', 'agent', 'admin'), createPolicy);
router.get('/', protect, getPolicies);
router.get('/:id', protect, getPolicy);
router.put('/:id', authorize('admin', 'agent'), updatePolicy);

module.exports = router;
