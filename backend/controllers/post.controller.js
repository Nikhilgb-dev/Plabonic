import Post from "../models/post.model.js";

// CREATE
export const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      author: req.user._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

// GET POSTS FEED (public + from following)
export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({
      $or: [
        { visibility: "public" },
        { author: { $in: req.user.following } },
        { author: userId }, // include own posts
      ],
    })
      .sort({ createdAt: -1 })
      .populate("author", "name profilePhoto headline")
      .populate("comments.user", "name profilePhoto");

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

// LIKE / UNLIKE
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "We could not find that post." });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

// COMMENT
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "We could not find that post." });

    const comment = { user: req.user._id, text };
    post.comments.push(comment);
    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

// SHARE (repost)
export const sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "We could not find that post." });

    const userId = req.user._id.toString();
    if (post.shares.includes(userId)) {
      return res.status(400).json({ message: "You already shared this post" });
    }

    post.shares.push(userId);
    await post.save();

    // Optional: create a new "shared post" entry
    const sharedPost = await Post.create({
      author: req.user._id,
      text: req.body.text || "", // optional caption
      sharedFrom: post._id,
      visibility: "public",
    });

    res.status(201).json({ message: "Post shared", sharedPost });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};


