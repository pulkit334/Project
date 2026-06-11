const Post = require('../models/post');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let image = '';

    if (req.file) {
      image = await uploadToCloudinary(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    if (!text && !image) {
      return res.status(400).json({ success: false, message: 'Please provide text or image' });
    }

    const post = await Post.create({
      user: req.user.id,
      username: req.user.username,
      text: text || '',
      image
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'username avatar');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'newest';

    let sortQuery = { createdAt: -1 };
    if (sort === 'most_liked') sortQuery = { 'likes.length': -1 };
    if (sort === 'most_commented') sortQuery = { 'comments.length': -1 };

    const posts = await Post.find()
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate('user', 'username avatar');

    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    const posts = await Post.find({
      $or: [
        { text: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('user', 'username avatar');

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.user.id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      post.likeUsernames = post.likeUsernames.filter(name => name !== req.user.username);
    } else {
      post.likes.push(req.user.id);
      post.likeUsernames.push(req.user.username);
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes,
      likeUsernames: post.likeUsernames,
      liked: !alreadyLiked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = {
      user: req.user.id,
      username: req.user.username,
      text
    };

    post.comments.unshift(comment);
    await post.save();

    res.status(201).json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('comments.user', 'username avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
