const Comment = require("../models/comment");

const fetchReplies = async (commentId) => {
  const replies = await Comment.find({ parentCommentId: commentId })
    .sort({ createdAt: -1 })
    .lean();
  for (let reply of replies) {
    reply.replies = await fetchReplies(reply._id);
  }
  return replies;
};

const handleCreateComment = async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  try {
    const comment = new Comment({
      postId,
      userId: req.user.id,
      text,
    });
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).send("Internal Server error");
  }
};

const handleRepyComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  try {
    const reply = new Comment({
      postId,
      parentCommentId: commentId,
      userId: req.user.id,
      text,
    });
    await reply.save();
    res.json(reply);
  } catch (err) {
    res.status(500).send("Internal Server error");
  }
};

const handleGetCommentForAPost = async (req, res) => {
  const { postId } = req.params;
  const { sortBy = "createdAt", sortOrder = "desc" } = req.query;

  try {
    const comments = await Comment.find({ postId, parentCommentId: null })
      .sort([[sortBy, sortOrder]])
      .lean();

    for (let comment of comments) {
      comment.replies = await fetchReplies(comment._id);
      comment.totalReplies = await Comment.countDocuments({
        parentCommentId: comment._id,
      });
    }

    res.json(comments);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching comments" });
  }
};

const handleExpandCommentWithPagination = async (req, res) => {
  const { postId, commentId } = req.params;
  const { page = 1, pageSize = 1 } = req.query;

  try {
    // Fetch the top-level comments (comments with no parentCommentId)
    const comments = await Comment.find({ postId, parentCommentId: null })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    // For each top-level comment, fetch its nested replies
    for (let comment of comments) {
      comment.replies = await fetchReplies(comment._id);
      comment.totalReplies = await Comment.countDocuments({
        parentCommentId: comment._id,
      });
    }

    res.json(comments);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

module.exports = {
  handleCreateComment,
  handleRepyComment,
  handleGetCommentForAPost,
  handleExpandCommentWithPagination,
};
