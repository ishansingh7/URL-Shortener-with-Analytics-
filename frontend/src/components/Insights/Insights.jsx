import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  BarChart3,
  Globe2,
  Link2,
  MonitorSmartphone,
  MousePointerClick,
  Search,
  TimerReset,
  QrCode,
  X,
} from "lucide-react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import "./Insights.css";
import {
  API_URL,
  formatDateTime,
  mapToEntries,
  normalizeUrlRecord,
  safetyClassName,
} from "../../utils/urlHelpers";

const normalizeAnalyticsPayload = (urls) => {
  const normalizedUrls = (urls || []).map(
    (item) => ({
      ...normalizeUrlRecord(item),
      analytics: item.analytics || {
        totalClicks: item.clicks || 0,
        lastVisitedAt:
          item.lastVisitedAt || null,
        recentVisitHistory: [],
        dailyTrend: [],
        browsers: {},
        devices: {},
        operatingSystems: {},
      },
    })
  );

  const totalClicks = normalizedUrls.reduce(
    (sum, item) =>
      sum + (item.analytics.totalClicks || 0),
    0
  );

  const totalVisitsToday =
    normalizedUrls.reduce((sum, item) => {
      const todayKey = new Date()
        .toISOString()
        .slice(0, 10);

      const todayCount =
        item.analytics.dailyTrend?.find(
          (entry) => entry.date === todayKey
        )?.count || 0;

      return sum + todayCount;
    }, 0);

  return {
    summary: {
      totalUrls: normalizedUrls.length,
      totalClicks,
      totalVisitsToday,
    },
    urls: normalizedUrls,
  };
};

function Insights() {
  const [analyticsData, setAnalyticsData] =
    useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [searchParams, setSearchParams] =
    useSearchParams();
  const [qrModalData, setQrModalData] =
    useState(null);

  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );
  const token = userInfo?.token;

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/url/analytics`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (isMounted) {
          setAnalyticsData({
            ...res.data,
            urls: (res.data.urls || []).map(
              normalizeUrlRecord
            ),
          });
        }
      } catch (error) {
        try {
          const fallbackRes = await axios.get(
            `${API_URL}/api/url`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (isMounted) {
            setAnalyticsData(
              normalizeAnalyticsPayload(
                fallbackRes.data
              )
            );
          }
        } catch (fallbackError) {
          if (isMounted) {
            alert(
              fallbackError.response?.data
                ?.message ||
                error.response?.data
                  ?.message ||
                "Unable to load analytics"
            );
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const urls = analyticsData?.urls || [];

  const filteredUrls = urls.filter((item) =>
    item.originalUrl
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    item.shortUrl
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    item.shortCode
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedUrlId =
    searchParams.get("url") ||
    filteredUrls[0]?._id ||
    "";
  const currentSearchUrl =
    searchParams.get("url") || "";

  const selectedUrl =
    filteredUrls.find(
      (item) => item._id === selectedUrlId
    ) || filteredUrls[0];

  useEffect(() => {
    if (
      selectedUrl &&
      currentSearchUrl !== selectedUrl._id
    ) {
      setSearchParams({
        url: selectedUrl._id,
      });
    }
  }, [
    currentSearchUrl,
    selectedUrl,
    setSearchParams,
  ]);

  const renderBreakdown = (title, items) => (
    <div className="insight-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
      </div>

      <div className="breakdown-list">
        {items.length === 0 ? (
          <span className="muted-copy">
            No data yet
          </span>
        ) : (
          items.map((item) => (
            <div
              key={`${title}-${item.label}`}
              className="breakdown-row"
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const showQrModal = (url) => {
    setQrModalData(url);
  };

  const closeQrModal = () => {
    setQrModalData(null);
  };

  const downloadQrCode = () => {
    const qrElement = document.getElementById("insights-qr-code-element");
    const canvas = qrElement.querySelector("canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${qrModalData.shortCode}-qr.png`;
    link.click();
  };

  const copyUrl = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      alert("Copied to clipboard!");
    } catch {
      alert("Unable to copy");
    }
  };

  return (
    <div className="analytics-page">
      <div className="analytics-shell">
        <div className="analytics-header">
          <div>
            <span className="analytics-badge">
              Professional Analytics
            </span>

            <h1>
              Analytics for every short URL,
              with detail that actually helps
            </h1>

            <p>
              Track total clicks, last visit
              time, browser and device mix,
              recent visit history, and daily
              click trends for each URL in your
              account.
            </p>
          </div>
        </div>

        <div className="analytics-summary-grid">
          <div className="analytics-summary-card">
            <div className="summary-icon">
              <Link2 size={22} />
            </div>
            <div>
              <h2>
                {analyticsData?.summary
                  ?.totalUrls || 0}
              </h2>
              <span>Total URLs</span>
            </div>
          </div>

          <div className="analytics-summary-card">
            <div className="summary-icon">
              <MousePointerClick size={22} />
            </div>
            <div>
              <h2>
                {analyticsData?.summary
                  ?.totalClicks || 0}
              </h2>
              <span>Total Clicks</span>
            </div>
          </div>

          <div className="analytics-summary-card">
            <div className="summary-icon">
              <TimerReset size={22} />
            </div>
            <div>
              <h2>
                {analyticsData?.summary
                  ?.totalVisitsToday || 0}
              </h2>
              <span>Visits Today</span>
            </div>
          </div>
        </div>

        <div className="analytics-search">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search URLs to inspect analytics"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        {loading ? (
          <div className="analytics-empty">
            Loading analytics...
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="analytics-empty">
            No analytics found for this search
          </div>
        ) : (
          <div className="analytics-grid">
            <div className="analytics-list-panel">
              {filteredUrls.map((item) => (
                <button
                  key={item._id}
                  className={`analytics-url-card ${selectedUrl?._id === item._id ? "selected" : ""}`}
                  onClick={() =>
                    setSearchParams({
                      url: item._id,
                    })
                  }
                >
                  <div className="analytics-url-top">
                    <span className="analytics-short-code">
                      /{item.shortCode}
                    </span>

                    <div className="analytics-card-meta">
                      <span
                        className={`analytics-safety-pill ${safetyClassName(item.safety?.level)}`}
                      >
                        {item.safety?.label ||
                          "Unchecked"}
                      </span>

                      <span className="analytics-click-pill">
                        {item.analytics.totalClicks}
                      </span>
                    </div>
                  </div>

                  <strong>
                    {item.shortUrl}
                  </strong>

                  <p>{item.originalUrl}</p>

                  <div className="analytics-url-meta">
                    <span>
                      Last visit:{" "}
                      {formatDateTime(
                        item.analytics
                          .lastVisitedAt
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedUrl && (
              <div className="analytics-detail-panel">
                <div className="detail-hero">
                  <div>
                    <span className="detail-kicker">
                      URL Insights
                    </span>
                    <h2>
                      {selectedUrl.shortUrl}
                    </h2>
                    <p>
                      {selectedUrl.originalUrl}
                    </p>
                  </div>

                  <div className="detail-links">
                    <a
                      href={selectedUrl.redirectUrl || selectedUrl.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="detail-link-btn"
                    >
                      <Globe2 size={16} />
                      Open Short URL
                    </a>

                    <Link
                      to={`/manage-urls`}
                      className="detail-link-btn"
                    >
                      <Globe2 size={16} />
                      Manage URL
                    </Link>

                    <Link
                      to={`/public-stats/${selectedUrl.shortCode}`}
                      className="detail-link-btn"
                    >
                      <BarChart3 size={16} />
                      Public Stats
                    </Link>
                  </div>
                </div>

                <div className="detail-stat-grid">
                  <div className="detail-stat-card">
                    <span>Total Click Count</span>
                    <strong>
                      {
                        selectedUrl.analytics
                          .totalClicks
                      }
                    </strong>
                  </div>

                  <div className="detail-stat-card">
                    <span>Last Visited Time</span>
                    <strong>
                      {formatDateTime(
                        selectedUrl.analytics
                          .lastVisitedAt
                      )}
                    </strong>
                  </div>

                  <div className="detail-stat-card">
                    <span>Recent Visits</span>
                    <strong>
                      {
                        selectedUrl.analytics
                          .recentVisitHistory
                          .length
                      }
                    </strong>
                  </div>

                  <div className="detail-stat-card">
                    <span>Safety Status</span>
                    <strong>
                      {selectedUrl.safety?.label ||
                        "Unchecked"}
                    </strong>
                  </div>
                </div>

                <div className="chart-panel">
                  <div className="panel-heading">
                    <h3>URL QR Code</h3>
                    <span>Share your short URL with a QR code</span>
                  </div>

                  <div className="qr-display-section">
                    <div className="qr-preview">
                      <QRCodeSVG
                        value={selectedUrl.shortUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <div className="qr-actions">
                      <button
                        className="qr-action-btn primary"
                        onClick={() => showQrModal(selectedUrl)}
                      >
                        <QrCode size={16} />
                        View Full QR Code
                      </button>

                      <button
                        className="qr-action-btn"
                        onClick={() => copyUrl(selectedUrl.shortUrl)}
                      >
                        <Link2 size={16} />
                        Copy Short URL
                      </button>
                    </div>
                  </div>
                </div>

                {selectedUrl.safety && (
                  <div className="chart-panel">
                    <div className="panel-heading">
                      <h3>
                        Safety Detection
                      </h3>
                      <span>
                        Heuristic URL risk scan
                      </span>
                    </div>

                    <div className="detail-safety-box">
                      <span
                        className={`analytics-safety-pill ${safetyClassName(selectedUrl.safety.level)}`}
                      >
                        {selectedUrl.safety.label}
                      </span>

                      <strong>
                        Safety score:{" "}
                        {selectedUrl.safety.score}
                        /100
                      </strong>

                      <p>
                        {selectedUrl.safety.note}
                      </p>

                      <ul className="detail-safety-list">
                        {selectedUrl.safety.reasons.map(
                          (reason) => (
                            <li key={reason}>
                              {reason}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="chart-panel">
                  <div className="panel-heading">
                    <h3>
                      Daily Click Trends
                    </h3>
                    <span>
                      Charts for daily click
                      performance
                    </span>
                  </div>

                  <div className="trend-chart">
                    {selectedUrl.analytics
                      .dailyTrend.length === 0 ? (
                      <div className="muted-copy">
                        No clicks recorded yet
                      </div>
                    ) : (
                      selectedUrl.analytics.dailyTrend.map(
                        (entry) => {
                          const maxCount = Math.max(
                            ...selectedUrl
                              .analytics.dailyTrend.map(
                                (item) =>
                                  item.count
                              ),
                            1
                          );

                          return (
                            <div
                              key={entry.date}
                              className="trend-row"
                            >
                              <span>
                                {entry.date}
                              </span>

                              <div className="trend-bar-track">
                                <div
                                  className="trend-bar-fill"
                                  style={{
                                    width: `${(entry.count / maxCount) * 100}%`,
                                  }}
                                />
                              </div>

                              <strong>
                                {entry.count}
                              </strong>
                            </div>
                          );
                        }
                      )
                    )}
                  </div>
                </div>

                <div className="insight-grid">
                  {renderBreakdown(
                    "Browser Analytics",
                    mapToEntries(
                      selectedUrl.analytics
                        .browsers
                    )
                  )}

                  {renderBreakdown(
                    "Device Analytics",
                    mapToEntries(
                      selectedUrl.analytics
                        .devices
                    )
                  )}

                  {renderBreakdown(
                    "Operating Systems",
                    mapToEntries(
                      selectedUrl.analytics
                        .operatingSystems
                    )
                  )}

                  <div className="insight-panel">
                    <div className="panel-heading">
                      <h3>
                        Recent Visit History
                      </h3>
                    </div>

                    <div className="history-list">
                      {selectedUrl.analytics
                        .recentVisitHistory
                        .length === 0 ? (
                        <span className="muted-copy">
                          No visits recorded yet
                        </span>
                      ) : (
                        selectedUrl.analytics.recentVisitHistory.map(
                          (
                            visit,
                            index
                          ) => (
                            <div
                              key={`${visit.visitedAt}-${index}`}
                              className="history-row"
                            >
                              <div>
                                <strong>
                                  {formatDateTime(
                                    visit.visitedAt
                                  )}
                                </strong>
                                <span>
                                  {visit.browser} on{" "}
                                  {visit.os}
                                </span>
                              </div>

                              <div className="history-chip">
                                <MonitorSmartphone size={14} />
                                {
                                  visit.deviceType
                                }
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {qrModalData && (
          <div className="qr-modal-overlay" onClick={closeQrModal}>
            <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="qr-modal-header">
                <h2>QR Code</h2>
                <button
                  className="qr-close-btn"
                  onClick={closeQrModal}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="qr-modal-content">
                <div id="insights-qr-code-element" className="qr-code-container">
                  <QRCodeSVG
                    value={qrModalData.shortUrl}
                    size={300}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="qr-modal-info">
                  <p>
                    <strong>Short URL:</strong> {qrModalData.shortUrl}
                  </p>
                  <p>
                    <strong>Short Code:</strong> {qrModalData.shortCode}
                  </p>
                  {qrModalData.expiresAt && (
                    <p>
                      <strong>Expires:</strong> {new Date(qrModalData.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="qr-modal-actions">
                  <button
                    className="download-qr-btn"
                    onClick={downloadQrCode}
                  >
                    Download QR Code
                  </button>
                  <button
                    className="copy-qr-btn"
                    onClick={() => copyUrl(qrModalData.shortUrl)}
                  >
                    Copy Short URL
                  </button>
                  <button
                    className="cancel-qr-btn"
                    onClick={closeQrModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Insights;
