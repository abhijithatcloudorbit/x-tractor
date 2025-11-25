import React, { useState } from "react";
import "./index.css";

export default function DashboardPage() {
  // --------------------------------------------------------------------
  // PRIMARY BUTTON
  // --------------------------------------------------------------------
  const PrimaryButton = ({ children, onClick, style = {} }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onClick={onClick}
        style={{
          backgroundColor: "var(--brand)",
          color: "#ffffff",
          padding: "12px 28px",
          border: "none",
          borderRadius: "20px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily:
            '"Plus Jakarta Sans", "Inter", "Segoe UI", Helvetica, Arial, sans-serif',
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transform: pressed ? "scale(0.97)" : "scale(1)",
          transition: "all 0.18s ease",
          ...style,
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#ffffff";
          e.target.style.color = "var(--brand)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "var(--brand)";
          e.target.style.color = "#ffffff";
        }}
      >
        {children}
      </button>
    );
  };

  // --------------------------------------------------------------------
  // NAVBAR (ALL BUTTONS FIXED)
  // --------------------------------------------------------------------
  const Navbar = () => (
    <nav
      style={{
        width: "100%",
        padding: "20px 40px",
        backgroundColor: "var(--brand)",
        color: "white",
        fontFamily:
          '"Plus Jakarta Sans", "Inter", "Segoe UI", Helvetica, Arial, sans-serif',
        fontWeight: 600,
        fontSize: "2.4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
      }}
    >
      {/* Left Logo */}
      <div>X-tractor</div>

      {/* Right Navigation Buttons */}
      <div style={{ display: "flex", gap: "18px", marginRight: "60px" }}>
        {["Home", "About", "Contact", "Dashboard"].map((label) => (
          <div
            key={label}
            style={{
              padding: "10px 26px",
              borderRadius: "50px",
              backgroundColor: "white",
              color: "var(--brand)",
              fontSize: "1.15rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily:
                '"Plus Jakarta Sans", "Inter", "Segoe UI", Helvetica, Arial, sans-serif',
              transition: "0.2s ease",
              border: "2px solid white",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--brand)";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.borderColor = "#ffffff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = "var(--brand)";
              e.currentTarget.style.borderColor = "white";
            }}
          >
            <a
              href={label === "Home" ? "/" : `/${label.toLowerCase()}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "inline-block",
                width: "100%",
                height: "100%",
              }}
            >
              {label}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );

  // --------------------------------------------------------------------
  // STATES
  // --------------------------------------------------------------------
  const [files, setFiles] = useState([]);
  const [rejected, setRejected] = useState("");
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activity, setActivity] = useState([]);

  // --------------------------------------------------------------------
  // UPLOAD LOGIC
  // --------------------------------------------------------------------
  const simulateUpload = () => {
    setProgress(0);
    let val = 0;
    const timer = setInterval(() => {
      val += 8;
      setProgress(val);
      if (val >= 100) clearInterval(timer);
    }, 120);
  };

  const processFiles = (fileList) => {
    const accepted = [];
    const rejectedFiles = [];

    Array.from(fileList).forEach((file) => {
      if (
        file.type.includes("pdf") ||
        file.type.includes("png") ||
        file.type.includes("jpg") ||
        file.type.includes("jpeg")
      ) {
        accepted.push(file);
      } else {
        rejectedFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) setRejected("Only PDF, PNG, JPG, JPEG allowed.");
    else setRejected("");

    if (accepted.length > 0) {
      simulateUpload();
      const timestamp = new Date().toLocaleTimeString();

      const mapped = accepted.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
        type: f.type.includes("pdf") ? "pdf" : "image",
        time: timestamp,
      }));

      setFiles((prev) => [...mapped, ...prev]);
      setActivity((prev) => [{ text: `Uploaded ${accepted[0].name}`, time: timestamp }, ...prev]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const handleBrowse = (e) => processFiles(e.target.files);

  // --------------------------------------------------------------------
  // RENDER JSX
  // --------------------------------------------------------------------
  return (
    <>
      <Navbar />

      <div className="dash-wrapper">
        {/* SIDEBAR */}
        <aside className="dash-sidebar">
          <h2 className="side-heading">Dashboard</h2>
          <ul className="side-nav">
            <li>Overview</li>
            <li>Uploads</li>
            <li>Activity</li>
            <li>Settings</li>
          </ul>
        </aside>

        {/* MAIN */}
        <main className="dash-main">
          <h1 className="page-title">Upload Center</h1>

          <div className="grid-2col">
            {/* STORAGE CARD */}
            <section className="card storage-card">
              <h3 className="card-title">Storage Used</h3>
              <div className="storage-circle-wrapper">
                <svg width="110" height="110">
                  <circle cx="55" cy="55" r="45" stroke="#e3e7ee" strokeWidth="8" fill="none" />
                  <circle
                    cx="55"
                    cy="55"
                    r="45"
                    stroke="var(--brand)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={282}
                    strokeDashoffset={282 - files.length * 20}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="storage-value">{files.length * 10}MB / 100MB</p>
            </section>

            {/* UPLOAD ZONE */}
            <section className="card">
              <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("fileInput").click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleBrowse}
                />

                <p className="drop-text">Drag & drop your files</p>
                <p className="drop-sub">PDF, PNG, JPG, JPEG only</p>
              </div>

              {progress > 0 && progress < 100 && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              )}

              {rejected && <p className="error-msg">{rejected}</p>}
            </section>
          </div>

          {/* RECENT UPLOADS */}
          {files.length > 0 && (
            <section className="card">
              <h3 className="card-title">Recent Uploads</h3>

              <ul className="file-list">
                {files.map((f, i) => (
                  <li key={i} className="file-row">
                    <span>{f.type === "pdf" ? "📄" : "🖼️"}</span>

                    <span
                      className="file-name"
                      onClick={() => setPreview(f)}
                      style={{ cursor: "pointer" }}
                    >
                      {f.file.name}
                    </span>

                    <span className="file-size">
                      {Math.round(f.file.size / 1024)} KB
                    </span>

                    {/* DOWNLOAD BUTTON */}
                    <button
                      style={{
                        padding: "6px 15px",
                        borderRadius: "8px",
                        border: "1px solid var(--brand)",
                        background: "white",
                        color: "var(--brand)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "var(--brand)";
                        e.target.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "white";
                        e.target.style.color = "var(--brand)";
                      }}
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = f.url;
                        a.download = f.file.name;
                        a.click();
                      }}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ACTIVITY LOG */}
          <section className="card">
            <h3 className="card-title">Activity Log</h3>
            <ul className="activity-list">
              {activity.map((act, idx) => (
                <li key={idx} className="activity-row">
                  {act.time} — {act.text}
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>

      {/* MODAL */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-box">
            <h3 className="modal-title">{preview.file.name}</h3>

            {preview.type === "image" ? (
              <img src={preview.url} className="modal-img" alt="" />
            ) : (
              <iframe src={preview.url} className="modal-pdf" title="PDF Preview" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
