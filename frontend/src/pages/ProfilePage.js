import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './ProfilePage.css';

const ProfilePage = ({ username = "testuser" }) => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [dataType, setDataType] = useState("");
  const [preview, setPreview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handlePreview = (e) => {
    e.preventDefault();
    if (!file || !filename || !dataType) {
      alert("Please complete all fields first.");
      return;
    }
    setShowConfirm(true);
  };

  const handleUpload = () => {
    alert(`✅ Uploaded "${filename}" (${dataType}) successfully!`);
    setShowConfirm(false);
    setFile(null);
    setFilename("");
    setDataType("");
    setPreview(null);
  };

  return (
    <div className="profile-desktop-grid">
      {/* Left: Avatar & Nav */}
      <div className="profile-left">
        <img
          src="/profile-picture.png"
          alt="Profile Avatar"
          className="robot-avatar"
        />
        <h1 className="profile-name">Welcome, <span>{username}</span></h1>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </button>
          <button className="nav-btn" onClick={() => navigate("/chat")}>
            🤖 CeCe: Your AI Business Companion
          </button>
        </div>
      </div>

      {/* Right: Upload Form */}
      <div className="profile-right">
        <h2>Upload Business Data</h2>
        <form className="upload-form" onSubmit={handlePreview}>
          <label>
            File Name
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="e.g. Q2_Analytics"
              required
            />
          </label>

          <label>
            Data Type
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              required
            >
              <option value="">-- Select --</option>
              <option>Sales Report</option>
              <option>Customer Feedback</option>
              <option>Financial Records</option>
              <option>Marketing Analytics</option>
              <option>Inventory Logs</option>
              <option>Employee Data</option>
            </select>
          </label>

          <label>
            Choose File
            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
              required
            />
          </label>

          <button type="submit">Preview & Confirm</button>
        </form>

        {showConfirm && (
          <div className="confirmation-box">
            <h3>Confirm Upload</h3>
            <p><strong>File Name:</strong> {filename}</p>
            <p><strong>Data Type:</strong> {dataType}</p>
            {preview && (
              <iframe title="preview" src={preview} className="file-preview" />
            )}
            <div className="confirm-actions">
              <button onClick={handleUpload}>✅ Confirm Upload</button>
              <button onClick={() => setShowConfirm(false)}>❌ Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

