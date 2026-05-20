const suspiciousKeywords = [
  "login",
  "verify",
  "update-account",
  "secure-account",
  "wallet",
  "crypto",
  "airdrop",
  "bonus",
  "free",
  "gift",
  "claim",
  "winner",
  "prize",
  "banking",
  "paypaI",
  "support",
  "signin",
  "password",
];

const suspiciousTlds = new Set([
  "zip",
  "mov",
  "click",
  "top",
  "gq",
  "work",
  "party",
  "support",
  "country",
  "stream",
  "download",
]);

const knownBrands = [
  "google",
  "paypal",
  "microsoft",
  "apple",
  "amazon",
  "instagram",
  "facebook",
  "whatsapp",
  "bank",
  "netflix",
];

const isIpHost = (hostname) =>
  /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);

const countMatches = (value, pattern) =>
  (value.match(pattern) || []).length;

const analyzeUrlSafety = (value) => {
  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    const search = parsedUrl.search.toLowerCase();
    const full = `${hostname}${pathname}${search}`;
    const tld = hostname.split(".").pop() || "";

    let score = 0;
    const reasons = [];

    if (parsedUrl.protocol !== "https:") {
      score += 18;
      reasons.push("Uses HTTP instead of HTTPS.");
    }

    if (isIpHost(hostname)) {
      score += 35;
      reasons.push("Uses a raw IP address instead of a domain.");
    }

    if (hostname.includes("xn--")) {
      score += 32;
      reasons.push("Contains punycode characters that may hide lookalike domains.");
    }

    if (suspiciousTlds.has(tld)) {
      score += 18;
      reasons.push(`Uses a higher-risk domain ending .${tld}.`);
    }

    const hyphenCount = countMatches(hostname, /-/g);
    if (hyphenCount >= 3) {
      score += 10;
      reasons.push("Domain contains many hyphens.");
    }

    if (hostname.length > 35) {
      score += 8;
      reasons.push("Domain is unusually long.");
    }

    const digitCount = countMatches(hostname, /\d/g);
    if (digitCount >= 5) {
      score += 8;
      reasons.push("Domain contains many digits.");
    }

    const matchedKeywords =
      suspiciousKeywords.filter((keyword) =>
        full.includes(keyword)
      );
    if (matchedKeywords.length > 0) {
      score += Math.min(
        28,
        matchedKeywords.length * 7
      );
      reasons.push(
        `Contains suspicious terms: ${matchedKeywords.slice(0, 4).join(", ")}.`
      );
    }

    const brandMatch = knownBrands.find(
      (brand) =>
        full.includes(brand) &&
        !hostname.endsWith(`${brand}.com`) &&
        !hostname.startsWith(`${brand}.`)
    );
    if (brandMatch) {
      score += 20;
      reasons.push(
        `Mentions brand-like text "${brandMatch}" outside a trusted main domain.`
      );
    }

    if (
      search.includes("redirect=") ||
      search.includes("url=") ||
      search.includes("next=") ||
      search.includes("target=")
    ) {
      score += 10;
      reasons.push("Contains redirect-style query parameters.");
    }

    let level = "good";
    let label = "Good";

    if (score >= 55) {
      level = "dangerous";
      label = "Dangerous / Scam";
    } else if (score >= 28) {
      level = "risky";
      label = "Risky";
    }

    return {
      level,
      label,
      score,
      reasons:
        reasons.length > 0
          ? reasons
          : [
              "No obvious scam indicators were detected by the built-in heuristic scan.",
            ],
      checkedAt: new Date().toISOString(),
      note: "Heuristic safety check only. This is not a guarantee.",
    };
  } catch {
    return {
      level: "dangerous",
      label: "Dangerous / Scam",
      score: 100,
      reasons: [
        "URL could not be parsed safely.",
      ],
      checkedAt: new Date().toISOString(),
      note: "Heuristic safety check only. This is not a guarantee.",
    };
  }
};

module.exports = {
  analyzeUrlSafety,
};
