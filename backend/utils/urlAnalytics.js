const MAX_RECENT_VISITS = 25;
const {
  analyzeUrlSafety,
} = require("./urlSafety");

const detectBrowser = (userAgent = "") => {
  if (/edg/i.test(userAgent)) {
    return "Edge";
  }

  if (/opr|opera/i.test(userAgent)) {
    return "Opera";
  }

  if (/chrome/i.test(userAgent) && !/edg|opr|opera/i.test(userAgent)) {
    return "Chrome";
  }

  if (/firefox/i.test(userAgent)) {
    return "Firefox";
  }

  if (/safari/i.test(userAgent) && !/chrome|chromium|edg|opr|opera/i.test(userAgent)) {
    return "Safari";
  }

  return "Unknown";
};

const detectOs = (userAgent = "") => {
  if (/windows/i.test(userAgent)) {
    return "Windows";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "iOS";
  }

  if (/mac os x|macintosh/i.test(userAgent)) {
    return "macOS";
  }

  if (/linux/i.test(userAgent)) {
    return "Linux";
  }

  return "Unknown";
};

const detectDeviceType = (userAgent = "") => {
  if (/ipad|tablet/i.test(userAgent)) {
    return "Tablet";
  }

  if (/mobi|iphone|android/i.test(userAgent)) {
    return "Mobile";
  }

  return "Desktop";
};

const buildVisitRecord = (req) => {
  const userAgent = req.get("user-agent") || "";
  const referrer = req.get("referer") || req.get("referrer") || "";

  return {
    visitedAt: new Date(),
    browser: detectBrowser(userAgent),
    os: detectOs(userAgent),
    deviceType: detectDeviceType(userAgent),
    referrer,
  };
};

const buildCountMap = (items, key) => {
  return items.reduce((accumulator, item) => {
    const label = item[key] || "Unknown";

    accumulator[label] = (accumulator[label] || 0) + 1;

    return accumulator;
  }, {});
};

const buildDailyTrend = (visits = []) => {
  const dailyMap = visits.reduce((accumulator, visit) => {
    const dayKey = new Date(visit.visitedAt).toISOString().slice(0, 10);

    accumulator[dayKey] = (accumulator[dayKey] || 0) + 1;

    return accumulator;
  }, {});

  return Object.entries(dailyMap)
    .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
    .map(([date, count]) => ({
      date,
      count,
    }));
};

const summarizeUrl = (url, shortUrl) => {
  const visits = Array.isArray(url.visits) ? url.visits : [];
  const recentVisits = [...visits]
    .sort((visitA, visitB) => new Date(visitB.visitedAt) - new Date(visitA.visitedAt))
    .slice(0, MAX_RECENT_VISITS);

  return {
    _id: url._id,
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    shortUrl,
    clicks: url.clicks,
    createdAt: url.createdAt,
    updatedAt: url.updatedAt,
    lastVisitedAt: url.lastVisitedAt,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shortUrl)}`,
    safety: analyzeUrlSafety(
      url.originalUrl
    ),
    analytics: {
      totalClicks: url.clicks,
      lastVisitedAt: url.lastVisitedAt,
      recentVisitHistory: recentVisits,
      dailyTrend: buildDailyTrend(visits),
      browsers: buildCountMap(visits, "browser"),
      devices: buildCountMap(visits, "deviceType"),
      operatingSystems: buildCountMap(visits, "os"),
      topReferrers: buildCountMap(
        visits.filter((visit) => visit.referrer),
        "referrer"
      ),
    },
  };
};

module.exports = {
  buildVisitRecord,
  summarizeUrl,
};
