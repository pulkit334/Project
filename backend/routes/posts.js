const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  addComment,
  getComments,
  deletePost,
  searchPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

router.get('/feed', protect, getFeedPosts);
router.get('/search', protect, searchPosts);
router.post('/', protect, upload.single('image'), createPost);
router.get('/user/:userId', protect, getUserPosts);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.get('/:id/comments', protect, getComments);
router.delete('/:id', protect, deletePost);

module.exports = router;
