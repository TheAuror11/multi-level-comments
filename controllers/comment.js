const Comment = require("../models/comment");

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
      const replies = await Comment.find({ parentCommentId: comment._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      comment.replies = replies;
      comment.totalReplies = await Comment.countDocuments({
        parentCommentId: comment._id,
      });
    }

    res.json(comments);
  } catch (err) {
    res.status(500).send("Internal Server error");
  }
};

const handleExpandCommentWithPagination = async (req, res) => {
  const { postId, commentId } = req.params;
  const { page = 1, pageSize = 10 } = req.query;

  try {
    const comments = await Comment.find({ postId, parentCommentId: commentId })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    for (let comment of comments) {
      const replies = await Comment.find({ parentCommentId: comment._id })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();
      comment.replies = replies;
      comment.totalReplies = await Comment.countDocuments({
        parentCommentId: comment._id,
      });
    }

    res.json(comments);
  } catch (err) {
    res.status(500).send("Interal Server error");
  }
};

module.exports = {
  handleCreateComment,
  handleRepyComment,
  handleGetCommentForAPost,
  handleExpandCommentWithPagination,
};
