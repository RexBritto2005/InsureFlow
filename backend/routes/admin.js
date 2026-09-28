const express = require('express');
const router = express.Router();
const { getDashboard, getAllClaims, getAllPolicies, getAllUsers, getAllPayments } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/claims', getAllClaims);
router.get('/policies', getAllPolicies);
router.get('/users', getAllUsers);
router.get('/payments', getAllPayments);

module.exports = router;
