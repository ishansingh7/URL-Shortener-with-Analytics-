import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  Link2,
  Copy,
  ExternalLink,
  Trash2,
  Search,
  BarChart3,
  MousePointerClick,
  Pencil,
  Save,
  Upload,
  Globe2,
  Clock3,
  X,
  QrCode,
} from "lucide-react";
import { Link } from "react-router-dom";

import "./ManageUrls.css";
import {
  API_URL,
  formatDate,
  formatDateTime,
  isValidUrl,
  normalizeUrlRecord,
  parseCsvUrls,
  safetyClassName,
} from "../../utils/urlHelpers";

function ManageUrls() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState("");
  const [searchTerm, setSearchTerm] =
    useState("");
  const [editingId, setEditingId] =
    useState("");
  const [editingValue, setEditingValue] =
    useState("");
  const [
    editingExpirationDays,
    setEditingExpirationDays,
  ] = useState("");
  const [savingId, setSavingId] =
    useState("");
  const [bulkLoading, setBulkLoading] =
    useState(false);
  const [bulkFileName, setBulkFileName] =
    useState("");
  const [qrModalData, setQrModalData] =
    useState(null);
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo")
  );

  const token = userInfo?.token;

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUrls = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/url`,
          authConfig
        );

        if (isMounted) {
          setUrls(
            res.data.map(
              normalizeUrlRecord
            )
          );
        }
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Unable to fetch URLs"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUrls();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const copyUrl = async (value) => {
    try {
      await navigator.clipboard.writeText(
        value
      );

      alert("Short URL copied");
    } catch {
      alert("Unable to copy URL");
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      await axios.delete(
        `${API_URL}/api/url/${id}`,
        authConfig
      );

      setUrls((currentUrls) =>
        currentUrls.filter(
          (item) => item._id !== id
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete URL"
      );
    } finally {
      setDeletingId("");
    }
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setEditingValue(item.originalUrl);
    setEditingExpirationDays(
      item.expirationDays
        ? `${item.expirationDays}`
        : ""
    );
  };

  const cancelEditing = () => {
    setEditingId("");
    setEditingValue("");
    setEditingExpirationDays("");
  };

  const handleSaveEdit = async (id) => {
    if (!editingValue) {
      return alert("Please enter a destination URL");
    }

    if (!isValidUrl(editingValue)) {
      return alert("Please enter a valid URL");
    }

    try {
      setSavingId(id);

      const res = await axios.put(
        `${API_URL}/api/url/${id}`,
        {
          originalUrl: editingValue,
          expirationDays:
            editingExpirationDays
              ? parseInt(
                  editingExpirationDays,
                  10
                )
              : 0,
        },
        authConfig
      );

      setUrls((currentUrls) =>
        currentUrls.map((item) =>
          item._id === id
            ? normalizeUrlRecord(
                res.data
              )
            : item
        )
      );

      cancelEditing();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update URL"
      );
    } finally {
      setSavingId("");
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setBulkFileName(file.name);

    try {
      setBulkLoading(true);

      const content = await file.text();
      const parsedUrls = parseCsvUrls(content);

      if (parsedUrls.length === 0) {
        throw new Error(
          "No URLs were found in the CSV"
        );
      }

      const res = await axios.post(
        `${API_URL}/api/url/bulk`,
        {
          urls: parsedUrls,
        },
        authConfig
      );

      setUrls((currentUrls) => [
        ...res.data.urls.map(
          normalizeUrlRecord
        ),
        ...currentUrls,
      ]);

      alert(
        `${res.data.createdCount} short URLs created successfully`
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to import CSV"
      );
    } finally {
      setBulkLoading(false);
      event.target.value = "";
    }
  };

  const showQrModal = (item) => {
    setQrModalData(item);
  };

  const closeQrModal = () => {
    setQrModalData(null);
  };

  const downloadQrCode = () => {
    const qrElement = document.getElementById("qr-code-element");
    const canvas = qrElement.querySelector("canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${qrModalData.shortCode}-qr.png`;
    link.click();
  };

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

  const totalClicks = urls.reduce(
    (acc, item) => acc + item.clicks,
    0
  );

  const visitedUrls = urls.filter(
    (item) => item.lastVisitedAt
  ).length;

  return (
    <div className="manage-page">
      <div className="manage-shell">
        <div className="manage-header">
          <div>
            <span className="manage-badge">
              URL Operations
            </span>

            <h1>
              Manage links with
              <br />
              live control and insights
            </h1>

            <p>
              Edit destinations, open
              analytics, publish public stats,
              and shorten many URLs at once
              from one polished workspace.
            </p>
          </div>

          <div className="bulk-card">
            <div className="bulk-copy">
              <h3>Bulk URL Shortening via CSV</h3>

              <p>
                Upload a CSV with one URL per
                row or a first-column `url`
                header to create many short
                links in one pass.
              </p>
            </div>

            <label className="bulk-upload-btn">
              <Upload size={18} />
              {bulkLoading
                ? "Importing..."
                : "Upload CSV"}
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleBulkUpload}
                disabled={bulkLoading}
              />
            </label>

            <span className="bulk-file-name">
              {bulkFileName || "No file selected"}
            </span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon">
              <Link2 size={24} />
            </div>

            <div>
              <h2>{urls.length}</h2>
              <span>Total URLs</span>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <MousePointerClick size={24} />
            </div>

            <div>
              <h2>{totalClicks}</h2>
              <span>Total Clicks</span>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon">
              <Clock3 size={24} />
            </div>

            <div>
              <h2>{visitedUrls}</h2>
              <span>Visited URLs</span>
            </div>
          </div>
        </div>

        <div className="search-container">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search by destination, short link, or short code"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        {loading ? (
          <div className="empty-box">
            Loading URLs...
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="empty-box">
            No URLs found
          </div>
        ) : (
          <div className="urls-grid">
            {filteredUrls.map((item) => {
              const isEditing =
                editingId === item._id;

              return (
                <div
                  key={item._id}
                  className="url-card"
                >
                  <div className="url-card-top">
                    <div className="url-icon">
                      <Link2 size={20} />
                    </div>

                    <div className="card-top-group">
                      <div
                        className={`safety-chip ${safetyClassName(item.safety?.level)}`}
                      >
                        {item.safety?.label ||
                          "Unchecked"}
                      </div>

                      <div className="click-badge">
                        {item.clicks} Clicks
                      </div>
                    </div>
                  </div>

                  <div className="url-content">
                    <div className="url-item">
                      <span>
                        Destination URL
                      </span>

                      {isEditing ? (
                        <div className="edit-url-box">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) =>
                              setEditingValue(
                                e.target.value
                              )
                            }
                          />

                          <div className="edit-actions">
                            <button
                              className="mini-action primary-mini-action"
                              onClick={() =>
                                handleSaveEdit(
                                  item._id
                                )
                              }
                              disabled={
                                savingId ===
                                item._id
                              }
                            >
                              <Save size={16} />
                              Save
                            </button>

                            <button
                              className="mini-action"
                              onClick={
                                cancelEditing
                              }
                            >
                              <X size={16} />
                              Cancel
                            </button>
                          </div>

                          <div className="expiration-input">
                            <label>
                              Expiration
                            </label>
                            <select
                              value={
                                editingExpirationDays
                              }
                              onChange={(e) =>
                                setEditingExpirationDays(
                                  e.target.value
                                )
                              }
                              className="expiration-select"
                            >
                              <option value="">
                                No Expiration
                              </option>
                              <option value="1">
                                1 Day
                              </option>
                              <option value="7">
                                7 Days
                              </option>
                              <option value="30">
                                30 Days
                              </option>
                              <option value="90">
                                90 Days
                              </option>
                              <option value="365">
                                1 Year
                              </option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <p>{item.originalUrl}</p>
                      )}
                    </div>

                    <div className="url-item">
                      <span>Short URL</span>

                      <a
                        href={item.redirectUrl || item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.shortUrl}
                      </a>
                    </div>

                    <div className="url-meta-grid">
                      <div className="url-meta-box">
                        <span>Created</span>
                        <strong>
                          {formatDate(
                            item.createdAt
                          )}
                        </strong>
                      </div>

                      <div className="url-meta-box">
                        <span>Last Visited</span>
                        <strong>
                          {formatDateTime(
                            item.lastVisitedAt
                          )}
                        </strong>
                      </div>

                      {item.expiresAt && (
                        <div
                          className={`url-meta-box expiry-box ${item.isExpired ? "expired" : "active"}`}
                        >
                          <span>
                            {item.isExpired
                              ? "Expired On"
                              : "Expires"}
                          </span>
                          <strong>
                            {formatDate(
                              item.expiresAt
                            )}
                          </strong>
                          <small>
                            {item.isExpired
                              ? "This short link is no longer active."
                              : "Active until the scheduled expiry date."}
                          </small>
                        </div>
                      )}

                      {item.isExpired && (
                        <div className="url-meta-box expired">
                          <span>Status</span>
                          <strong>Expired</strong>
                        </div>
                      )}
                    </div>

                    {item.safety && (
                      <div className="url-safety-box">
                        <span>
                          Link Safety
                        </span>
                        <strong>
                          {item.safety.label}
                        </strong>
                        <p>
                          {item.safety.reasons?.[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="resource-links">
                    <Link
                      to={`/analytics?url=${item._id}`}
                      className="resource-link"
                    >
                      <BarChart3 size={16} />
                      Analytics
                    </Link>

                    <Link
                      to={`/public-stats/${item.shortCode}`}
                      className="resource-link"
                    >
                      <Globe2 size={16} />
                      Public Stats
                    </Link>
                  </div>

                  <div className="url-footer">
                    <div className="url-actions">
                      <button
                        className="action-btn"
                        onClick={() =>
                          copyUrl(item.shortUrl)
                        }
                        title="Copy URL"
                      >
                        <Copy size={16} />
                      </button>

                      <a
                        href={item.redirectUrl || item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="action-btn"
                        title="Open URL"
                      >
                        <ExternalLink size={16} />
                      </a>

                      <button
                        className="action-btn"
                        onClick={() =>
                          showQrModal(item)
                        }
                        title="Show QR Code"
                      >
                        <QrCode size={16} />
                      </button>

                      <button
                        className="action-btn"
                        onClick={() =>
                          startEditing(item)
                        }
                        title="Edit URL"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() =>
                          handleDelete(item._id)
                        }
                        disabled={
                          deletingId === item._id
                        }
                        title="Delete URL"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
                <div id="qr-code-element" className="qr-code-container">
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
                      <strong>Expires:</strong> {formatDate(qrModalData.expiresAt)}
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

export default ManageUrls;
