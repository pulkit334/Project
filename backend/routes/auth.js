const express = require('express');
const router = express.Router();
const {
  signup, login, logout, getMe, getUserProfile,
  followUser, searchUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/search', protect, searchUsers);
router.get('/user/:userId', protect, getUserProfile);
router.post('/follow/:userId', protect, followUser);

module.exports = router;
