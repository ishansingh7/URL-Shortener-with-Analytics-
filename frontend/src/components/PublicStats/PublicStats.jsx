import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Globe2,
  Link2,
  MousePointerClick,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import "./PublicStats.css";
import {
  API_URL,
  formatDateTime,
  mapToEntries,
  normalizeShortUrl,
} from "../../utils/urlHelpers";

function PublicStats() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPublicStats = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/url/public/${shortCode}`
        );

        if (isMounted) {
          setData({
            ...res.data,
            redirectUrl: res.data.shortUrl,
            shortUrl: normalizeShortUrl(
              res.data.shortUrl
            ),
          });
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Unable to load public stats"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPublicStats();

    return () => {
      isMounted = false;
    };
  }, [shortCode]);

  const browserEntries = mapToEntries(
    data?.analytics?.browsers
  );

  return (
    <div className="public-stats-page">
      <div className="public-stats-shell">
        {loading ? (
          <div className="public-stats-card">
            Loading public stats...
          </div>
        ) : !data ? (
          <div className="public-stats-card">
            Public stats unavailable
          </div>
        ) : (
          <>
            <div className="public-hero">
              <span className="public-badge">
                Public Stats Page
              </span>

              <h1>
                Live performance for
                <br />
                /{data.shortCode}
              </h1>

              <p>{data.originalUrl}</p>

              <div className="public-link-row">
                <a
                  href={data.redirectUrl || data.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="public-link-btn"
                >
                  <Link2 size={16} />
                  Visit Short URL
                </a>

                <Link
                  to="/"
                  className="public-link-btn ghost"
                >
                  <Globe2 size={16} />
                  Home
                </Link>
              </div>
            </div>

            <div className="public-summary-grid">
              <div className="public-stats-card">
                <MousePointerClick size={22} />
                <strong>
                  {data.analytics.totalClicks}
                </strong>
                <span>Total Clicks</span>
              </div>

              <div className="public-stats-card">
                <BarChart3 size={22} />
                <strong>
                  {formatDateTime(
                    data.lastVisitedAt
                  )}
                </strong>
                <span>Last Visited</span>
              </div>

              <div className="public-stats-card">
                <Globe2 size={22} />
                <strong>
                  {browserEntries[0]?.label ||
                    "No data"}
                </strong>
                <span>Top Browser</span>
              </div>
            </div>

            <div className="public-layout">
              <div className="public-panel">
                <div className="public-panel-heading">
                  <h3>Daily Click Trends</h3>
                </div>

                <div className="public-trend-list">
                  {data.analytics.dailyTrend
                    .length === 0 ? (
                    <span className="public-muted">
                      No click data yet
                    </span>
                  ) : (
                    data.analytics.dailyTrend.map(
                      (entry) => {
                        const maxCount = Math.max(
                          ...data.analytics.dailyTrend.map(
                            (item) =>
                              item.count
                          ),
                          1
                        );

                        return (
                          <div
                            key={entry.date}
                            className="public-trend-row"
                          >
                            <span>
                              {entry.date}
                            </span>

                            <div className="public-trend-track">
                              <div
                                className="public-trend-fill"
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

              <div className="public-panel">
                <div className="public-panel-heading">
                  <h3>
                    Recent Visit History
                  </h3>
                </div>

                <div className="public-history-list">
                  {data.analytics
                    .recentVisitHistory.length ===
                  0 ? (
                    <span className="public-muted">
                      No visits recorded yet
                    </span>
                  ) : (
                    data.analytics.recentVisitHistory.map(
                      (visit, index) => (
                        <div
                          key={`${visit.visitedAt}-${index}`}
                          className="public-history-row"
                        >
                          <div>
                            <strong>
                              {formatDateTime(
                                visit.visitedAt
                              )}
                            </strong>

                            <span>
                              {
                                visit.deviceType
                              }{" "}
                              using{" "}
                              {visit.browser}
                            </span>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PublicStats;
