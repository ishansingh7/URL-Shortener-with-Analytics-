const express = require("express");

const protect = require("../middleware/authMiddleware");
const {
  shortenUrl,
  getUserUrls,
  getUrlAnalytics,
  getSingleUrlAnalytics,
  updateUrl,
  bulkShortenUrls,
  checkUrlSafety,
  getPublicUrlStats,
  deleteUrl,
} = require("../controllers/urlController");

const router = express.Router();

router.get("/public/:shortCode", getPublicUrlStats);
router.get("/analytics", protect, getUrlAnalytics);
router.post("/check-safety", protect, checkUrlSafety);
router.get("/:id", protect, getSingleUrlAnalytics);
router.post("/shorten", protect, shortenUrl);
router.post("/bulk", protect, bulkShortenUrls);
router.get("/", protect, getUserUrls);
router.put("/:id", protect, updateUrl);
router.delete("/:id", protect, deleteUrl);

module.exports = router;
