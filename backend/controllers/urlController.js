const crypto = require("crypto");

const Url = require("../models/Url");
const {
  buildVisitRecord,
  summarizeUrl,
} = require("../utils/urlAnalytics");
const {
  analyzeUrlSafety,
} = require("../utils/urlSafety");

const buildShortUrl = (req, shortCode) => {
  const baseUrl =
    process.env.SHORT_URL_BASE ||
    process.env.BASE_URL ||
    `${req.protocol}://${req.get("host")}`;

  return `${baseUrl.replace(/\/+$/, "")}/${shortCode}`;
};

const isValidHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);

    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
};

const generateUniqueShortCode = async () => {
  let shortCode;
  let existingUrl;

  do {
    shortCode = crypto
      .randomBytes(4)
      .toString("base64url")
      .slice(0, 6);

    existingUrl = await Url.findOne({ shortCode });
  } while (existingUrl);

  return shortCode;
};

const buildUrlResponse = (req, url) => {
  const shortUrl = buildShortUrl(req, url.shortCode);

  return summarizeUrl(url, shortUrl);
};

const createShortUrl = async (originalUrl, userId, expirationDays = null) => {
  const shortCode = await generateUniqueShortCode();
  
  const urlData = {
    user: userId,
    originalUrl,
    shortCode,
  };
  
  if (expirationDays && expirationDays > 0) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    urlData.expiresAt = expiresAt;
    urlData.expirationDays = expirationDays;
  }

  return Url.create(urlData);
};

const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, expirationDays } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "Original URL is required",
      });
    }

    if (!isValidHttpUrl(originalUrl)) {
      return res.status(400).json({
        message: "Please enter a valid URL",
      });
    }

    const url = await createShortUrl(
      originalUrl,
      req.user,
      expirationDays
    );

    res.status(201).json(
      buildUrlResponse(req, url)
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user }).sort({
      createdAt: -1,
    });

    res.status(200).json(
      urls.map((url) =>
        buildUrlResponse(req, url)
      )
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUrlAnalytics = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user }).sort({
      clicks: -1,
      updatedAt: -1,
    });

    const analytics = urls.map((url) =>
      buildUrlResponse(req, url)
    );

    const totalClicks = analytics.reduce(
      (accumulator, item) =>
        accumulator + item.analytics.totalClicks,
      0
    );

    const totalVisitsToday = analytics.reduce(
      (accumulator, item) => {
        const todayKey = new Date()
          .toISOString()
          .slice(0, 10);

        const todayCount =
          item.analytics.dailyTrend.find(
            (entry) => entry.date === todayKey
          )?.count || 0;

        return accumulator + todayCount;
      },
      0
    );

    res.status(200).json({
      summary: {
        totalUrls: analytics.length,
        totalClicks,
        totalVisitsToday,
      },
      urls: analytics,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getSingleUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      user: req.user,
    });

    if (!url) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    res.status(200).json(
      buildUrlResponse(req, url)
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateUrl = async (req, res) => {
  try {
    const { originalUrl, expirationDays } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "Original URL is required",
      });
    }

    if (!isValidHttpUrl(originalUrl)) {
      return res.status(400).json({
        message: "Please enter a valid URL",
      });
    }

    const url = await Url.findOne({
      _id: req.params.id,
      user: req.user,
    });

    if (!url) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    url.originalUrl = originalUrl;
    
    if (expirationDays !== undefined) {
      if (expirationDays && expirationDays > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);
        url.expiresAt = expiresAt;
        url.expirationDays = expirationDays;
        url.isExpired = false;
      } else {
        url.expiresAt = null;
        url.expirationDays = null;
        url.isExpired = false;
      }
    }
    
    await url.save();

    res.status(200).json(
      buildUrlResponse(req, url)
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const bulkShortenUrls = async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one URL",
      });
    }

    const cleanedUrls = urls
      .map((item) => `${item || ""}`.trim())
      .filter(Boolean);

    if (cleanedUrls.length === 0) {
      return res.status(400).json({
        message: "No valid URLs were found in the CSV",
      });
    }

    const invalidUrls = cleanedUrls.filter(
      (item) => !isValidHttpUrl(item)
    );

    if (invalidUrls.length > 0) {
      return res.status(400).json({
        message: `Invalid URLs found: ${invalidUrls.slice(0, 3).join(", ")}`,
      });
    }

    const createdUrls = [];

    for (const originalUrl of cleanedUrls) {
      const url = await createShortUrl(
        originalUrl,
        req.user
      );

      createdUrls.push(
        buildUrlResponse(req, url)
      );
    }

    res.status(201).json({
      createdCount: createdUrls.length,
      urls: createdUrls,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const checkUrlSafety = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "Original URL is required",
      });
    }

    if (!isValidHttpUrl(originalUrl)) {
      return res.status(400).json({
        message: "Please enter a valid URL",
      });
    }

    res.status(200).json({
      originalUrl,
      safety: analyzeUrlSafety(
        originalUrl
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPublicUrlStats = async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
    });

    if (!url) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    const shortUrl = buildShortUrl(req, url.shortCode);
    const data = summarizeUrl(url, shortUrl);

    res.status(200).json({
      shortCode: data.shortCode,
      shortUrl: data.shortUrl,
      originalUrl: data.originalUrl,
      createdAt: data.createdAt,
      lastVisitedAt: data.lastVisitedAt,
      analytics: {
        totalClicks: data.analytics.totalClicks,
        dailyTrend: data.analytics.dailyTrend,
        browsers: data.analytics.browsers,
        devices: data.analytics.devices,
        recentVisitHistory:
          data.analytics.recentVisitHistory,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      user: req.user,
    });

    if (!url) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    await url.deleteOne();

    res.status(200).json({
      message: "Short URL deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const redirectToOriginalUrl = async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.shortCode,
    });

    if (!url) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      if (!url.isExpired) {
        url.isExpired = true;
        await url.save();
      }
      return res.status(410).json({
        message: "This short URL has expired",
        expiredAt: url.expiresAt,
      });
    }

    const visit = buildVisitRecord(req);

    url.clicks += 1;
    url.lastVisitedAt = visit.visitedAt;
    url.visits.push(visit);
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  shortenUrl,
  getUserUrls,
  getUrlAnalytics,
  getSingleUrlAnalytics,
  updateUrl,
  bulkShortenUrls,
  checkUrlSafety,
  getPublicUrlStats,
  deleteUrl,
  redirectToOriginalUrl,
};
