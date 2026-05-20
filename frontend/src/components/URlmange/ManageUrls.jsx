import { useEffect, useState } from "react";
import axios from "axios";
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
  const [savingId, setSavingId] =
    useState("");
  const [bulkLoading, setBulkLoading] =
    useState(false);
  const [bulkFileName, setBulkFileName] =
    useState("");

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
  };

  const cancelEditing = () => {
    setEditingId("");
    setEditingValue("");
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
                      >
                        <Copy size={16} />
                      </button>

                      <a
                        href={item.redirectUrl || item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="action-btn"
                      >
                        <ExternalLink size={16} />
                      </a>

                      <button
                        className="action-btn"
                        onClick={() =>
                          startEditing(item)
                        }
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
      </div>
    </div>
  );
}

export default ManageUrls;
