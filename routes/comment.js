const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const rateLimit = require("../middlewares/rateLimitter");
const {
  handleCreateComment,
  handleRepyComment,
  handleGetCommentForAPost,
  handleExpandCommentWithPagination,
} = require("../controllers/comment");

router.post("/posts/:postId/comments", auth, rateLimit, handleCreateComment);
router.post(
  "/posts/:postId/comments/:commentId/reply",
  auth,
  rateLimit,
  handleRepyComment
);
router.get("/posts/:postId/comments", handleGetCommentForAPost);
router.get(
  "/posts/:postId/comments/:commentId/expand",
  handleExpandCommentWithPagination
);

module.exports = router;
