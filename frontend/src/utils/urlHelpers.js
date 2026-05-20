export const API_URL = "http://localhost:5000";
export const SHORT_URL_BASE =
  "http://shorturl";

export const isValidUrl = (value) => {
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

export const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export const formatDateTime = (value) => {
  if (!value) {
    return "Not visited yet";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const mapToEntries = (valueMap = {}) =>
  Object.entries(valueMap)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((entryA, entryB) => entryB.count - entryA.count);

const extractFirstCsvValue = (line) => {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return "";
  }

  if (trimmedLine.startsWith("\"")) {
    const closingQuoteIndex =
      trimmedLine.indexOf("\"", 1);

    if (closingQuoteIndex > 0) {
      return trimmedLine
        .slice(1, closingQuoteIndex)
        .trim();
    }
  }

  return trimmedLine
    .split(",")[0]
    .replace(/^"|"$/g, "")
    .trim();
};

export const parseCsvUrls = (content) => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const [firstLine, ...remainingLines] = lines;

  const shouldSkipHeader =
    firstLine.toLowerCase().includes("url");

  const candidateLines = shouldSkipHeader
    ? remainingLines
    : lines;

  return candidateLines
    .map(extractFirstCsvValue)
    .filter(Boolean);
};

export const safetyClassName = (
  level = "good"
) => {
  if (level === "dangerous") {
    return "danger";
  }

  if (level === "risky") {
    return "risk";
  }

  return "good";
};

export const normalizeShortUrl = (
  value
) => {
  if (!value) {
    return value;
  }

  try {
    const parsedUrl = new URL(value);

    return `${SHORT_URL_BASE}${parsedUrl.pathname}`;
  } catch {
    return value.replace(
      "http://localhost:5000",
      SHORT_URL_BASE
    );
  }
};

export const normalizeQrCodeUrl = (
  value
) => {
  if (!value) {
    return value;
  }

  return value.replace(
    encodeURIComponent(
      "http://localhost:5000"
    ),
    encodeURIComponent(SHORT_URL_BASE)
  );
};

export const normalizeUrlRecord = (
  item
) => {
  if (!item) {
    return item;
  }

  return {
    ...item,
    redirectUrl: item.shortUrl,
    shortUrl: normalizeShortUrl(
      item.shortUrl
    ),
    qrCodeUrl: normalizeQrCodeUrl(
      item.qrCodeUrl
    ),
  };
};
