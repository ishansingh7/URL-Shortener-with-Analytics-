import {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

import {
  Link2,
  QrCode,
  ScanLine,
  Copy,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  Zap,
  Camera,
  Upload,
  X,
} from "lucide-react";

import "./Dashboard.css";
import {
  normalizeUrlRecord,
  safetyClassName,
} from "../../utils/urlHelpers";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const [searchParams, setSearchParams] =
    useSearchParams();
  const videoRef = useRef(null);
  const scanFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [redirectUrl, setRedirectUrl] =
    useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeBlocked, setQrCodeBlocked] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] =
    useState(false);
  const [scannerMessage, setScannerMessage] =
    useState("");
  const [scannerLoading, setScannerLoading] =
    useState(false);
  const [scanningActive, setScanningActive] =
    useState(false);
  const [safetyState, setSafetyState] =
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

  const isValidUrl = (value) => {
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

  const shortenProvidedUrl = async (
    nextUrl
  ) => {
    if (!nextUrl) {
      return;
    }

    if (!isValidUrl(nextUrl)) {
      alert("Please Enter Valid URL");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/url/shorten`,
        {
          originalUrl: nextUrl,
        },
        authConfig
      );

      const normalizedUrl =
        normalizeUrlRecord(res.data);

      setShortUrl(
        normalizedUrl.shortUrl
      );
      setRedirectUrl(
        normalizedUrl.redirectUrl
      );
      setQrCodeUrl(
        normalizedUrl.qrCodeUrl
      );
      setQrCodeBlocked(false);
      setUrl("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Something Went Wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = () => {
    if (scanFrameRef.current) {
      cancelAnimationFrame(
        scanFrameRef.current
      );
      scanFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setScanningActive(false);
  };

  const closeScanner = () => {
    stopScanner();
    setScannerOpen(false);
    if (
      searchParams.get("scanner") === "1"
    ) {
      setSearchParams({});
    }
  };

  const applyScannedValue = (value) => {
    if (!value) {
      return;
    }

    const nextUrl = value.trim();
    setUrl(nextUrl);
    setScannerMessage(
      "QR code scanned successfully."
    );
    closeScanner();
    shortenProvidedUrl(nextUrl);
  };

  const startCameraScanner = async () => {
    if (
      !("BarcodeDetector" in window)
    ) {
      setScannerMessage(
        "QR scanning is not supported in this browser. Try Chrome or Edge, or use Scan from Image if supported."
      );
      return;
    }

    try {
      setScannerLoading(true);
      setScannerMessage("");

      const detector = new window.BarcodeDetector(
        {
          formats: ["qr_code"],
        }
      );

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
          }
        );

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanningActive(true);

      const detectFrame = async () => {
        if (!videoRef.current) {
          return;
        }

        try {
          const codes =
            await detector.detect(
              videoRef.current
            );

          if (codes.length > 0) {
            const nextValue =
              codes[0].rawValue || "";

            if (
              isValidUrl(nextValue)
            ) {
              applyScannedValue(
                nextValue
              );
              return;
            }

            setScannerMessage(
              "QR code found, but it does not contain a valid URL."
            );
          }
        } catch {
          setScannerMessage(
            "Unable to scan the camera feed right now."
          );
        }

        scanFrameRef.current =
          requestAnimationFrame(
            detectFrame
          );
      };

      scanFrameRef.current =
        requestAnimationFrame(detectFrame);
    } catch {
      setScannerMessage(
        "Camera access was denied or unavailable."
      );
    } finally {
      setScannerLoading(false);
    }
  };

  const handleQrImageUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !("BarcodeDetector" in window)
    ) {
      setScannerMessage(
        "Image QR scanning is not supported in this browser."
      );
      event.target.value = "";
      return;
    }

    try {
      setScannerLoading(true);
      setScannerMessage("");

      const detector = new window.BarcodeDetector(
        {
          formats: ["qr_code"],
        }
      );

      const bitmap =
        await createImageBitmap(file);
      const codes =
        await detector.detect(bitmap);

      if (!codes.length) {
        setScannerMessage(
          "No QR code was detected in that image."
        );
      } else if (
        !isValidUrl(
          codes[0].rawValue || ""
        )
      ) {
        setScannerMessage(
          "The QR image was scanned, but it does not contain a valid URL."
        );
      } else {
        applyScannedValue(
          codes[0].rawValue
        );
      }
    } catch {
      setScannerMessage(
        "Unable to scan that image."
      );
    } finally {
      setScannerLoading(false);
      event.target.value = "";
    }
  };

  useEffect(
    () => () => {
      stopScanner();
    },
    []
  );

  useEffect(() => {
    if (!url || !isValidUrl(url)) {
      setSafetyState(null);
      return;
    }

    const timeoutId = setTimeout(
      async () => {
        try {
          const res = await axios.post(
            `${API_URL}/api/url/check-safety`,
            {
              originalUrl: url,
            },
            authConfig
          );

          setSafetyState(
            res.data.safety
          );
        } catch {
          setSafetyState(null);
        }
      },
      350
    );

    return () =>
      clearTimeout(timeoutId);
  }, [url]);

  useEffect(() => {
    if (
      searchParams.get("scanner") === "1"
    ) {
      setScannerOpen(true);
      setScannerMessage("");
    }
  }, [searchParams]);

  const handleShorten = async () => {
    if (!url) {
      return alert("Please Enter URL");
    }

    await shortenProvidedUrl(url);
  };

  const copyUrl = async (value) => {
    try {
      await navigator.clipboard.writeText(
        value
      );

      alert("Short URL Copied");
    } catch {
      alert("Unable to copy short URL");
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-left">
          <span className="hero-badge">
            Professional URL Shortener
          </span>

          <h1>
            Transform Long URLs
            <br />
            Into Smart Links
          </h1>

          <p>
            Shorten links instantly, generate QR
            codes, track analytics, and manage
            your URLs professionally with one
            powerful platform.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <ShieldCheck size={20} />
              <span>Secure Redirects</span>
            </div>

            <div className="feature-item">
              <BarChart3 size={20} />
              <span>Advanced Analytics</span>
            </div>

            <div className="feature-item">
              <Zap size={20} />
              <span>Fast Performance</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="dashboard-card">
            <div className="dashboard-top">
              <div className="circle red"></div>
              <div className="circle yellow"></div>
              <div className="circle green"></div>
            </div>

            <div className="dashboard-header">
              <h2>URL Shortener</h2>

              <p>
                Paste your long URL below,
                generate a professional short
                link instantly, or scan a QR to
                import the destination URL.
              </p>
            </div>

            <div className="shortener-box">
              <div className="input-box">
                <Link2 size={22} />

                <input
                  type="text"
                  placeholder="Paste your long URL here..."
                  value={url}
                  onChange={(e) =>
                    setUrl(e.target.value)
                  }
                />
              </div>

              <div className="shortener-actions">
                <button
                  className="scanner-btn"
                  onClick={() => {
                    setScannerOpen(true);
                    setScannerMessage("");
                  }}
                  type="button"
                >
                  <ScanLine size={18} />
                  Scan QR URL
                </button>

                <button
                  className="shorten-btn"
                  onClick={handleShorten}
                  disabled={loading}
                >
                  {loading
                    ? "Generating..."
                    : "Generate Short URL"}
                </button>
              </div>
              </div>

              {safetyState && (
                <div className="safety-panel">
                  <div className="safety-panel-top">
                    <span
                      className={`safety-badge ${safetyClassName(safetyState.level)}`}
                    >
                      {safetyState.label}
                    </span>

                    <strong>
                      Safety score:{" "}
                      {safetyState.score}/100
                    </strong>
                  </div>

                  <p className="safety-note">
                    {safetyState.note}
                  </p>

                  <ul className="safety-reasons">
                    {safetyState.reasons
                      .slice(0, 3)
                      .map((reason) => (
                        <li key={reason}>
                          {reason}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

            {scannerOpen && (
              <div className="scanner-panel">
                <div className="scanner-panel-top">
                  <div>
                    <span className="scanner-label">
                      QR Scanner
                    </span>
                    <h3>
                      Scan a QR code to fill the
                      URL
                    </h3>
                  </div>

                  <button
                    className="scanner-close-btn"
                    onClick={closeScanner}
                    type="button"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="scanner-copy">
                  Use your camera or upload a QR
                  image. If the QR contains a
                  valid URL, it will be added to
                  the input automatically.
                </p>

                <div className="scanner-actions">
                  <button
                    className="scanner-secondary-btn"
                    onClick={startCameraScanner}
                    type="button"
                    disabled={scannerLoading}
                  >
                    <Camera size={18} />
                    {scanningActive
                      ? "Scanning..."
                      : "Open Camera"}
                  </button>

                  <label className="scanner-secondary-btn upload-scan-btn">
                    <Upload size={18} />
                    Scan from Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleQrImageUpload
                      }
                    />
                  </label>
                </div>

                <div className="scanner-preview">
                  <video
                    ref={videoRef}
                    className="scanner-video"
                    muted
                    playsInline
                  />

                  {!scanningActive && (
                    <div className="scanner-placeholder">
                      <QrCode size={34} />
                      <span>
                        Camera preview appears
                        here
                      </span>
                    </div>
                  )}
                </div>

                {scannerMessage && (
                  <div className="scanner-message">
                    {scannerMessage}
                  </div>
                )}
              </div>
            )}

            {shortUrl && (
              <div className="result-card">
                <div className="result-top">
                  <div>
                    <span className="result-label">
                      Short URL
                    </span>

                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="result-link"
                    >
                      {shortUrl}
                    </a>
                  </div>

                  <div className="result-actions">
                    <button
                      className="action-btn"
                      onClick={() =>
                        copyUrl(shortUrl)
                      }
                    >
                      <Copy size={18} />
                    </button>

                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="action-btn"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>

                <div className="qr-section">
                  <div className="qr-title">
                    <QrCode size={22} />
                    <h3>QR Code</h3>
                  </div>

                  <div className="qr-box">
                    {qrCodeUrl &&
                    !qrCodeBlocked ? (
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        onError={() =>
                          setQrCodeBlocked(true)
                        }
                      />
                    ) : (
                      <p className="qr-fallback-text">
                        QR preview is blocked by
                        your browser or
                        extension. The short URL
                        still works normally.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
