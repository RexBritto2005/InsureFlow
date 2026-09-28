const express = require('express');
const router = express.Router();
const { createClaim, getClaims, getClaim, updateClaimStatus } = require('../controllers/claimController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('customer'), createClaim);
router.get('/', protect, getClaims);
router.get('/:id', protect, getClaim);
router.put('/:id/status', authorize('adjuster', 'admin'), updateClaimStatus);

module.exports = router;
