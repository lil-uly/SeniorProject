import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Settings.css";

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user settings from the server
        axios.get("/api/settings")
            .then((response) => {
                setSettings(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching settings:", error);
                setLoading(false);
            });
    }, []);

    const handleSave = () => {
        // Save updated settings to the server
        axios.post("/api/settings", settings)
            .then(() => {
                alert("Settings saved successfully!");
            })
            .catch((error) => {
                console.error("Error saving settings:", error);
                alert("Failed to save settings.");
            });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setSettings((prevSettings) => ({
            ...prevSettings,
            [name]: value,
        }));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="settings-container">
            <h1 className="settings-header">Settings</h1>
            <form className="settings-form">
                {/* User Information */}
                <h2>Edit Your User Information</h2>
                <label>
                    Username:
                    <input
                        type="text"
                        name="username"
                        value={settings.username || ""}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={settings.email || ""}
                        onChange={handleChange}
                    />
                </label>

                {/* Notification Preferences */}
                <h2>Notification Preferences</h2>
                <label>
                    Receive Email Notifications:
                    <select
                        name="emailNotifications"
                        value={settings.emailNotifications || "yes"}
                        onChange={handleChange}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
                <label>
                    Receive SMS Notifications:
                    <select
                        name="smsNotifications"
                        value={settings.smsNotifications || "yes"}
                        onChange={handleChange}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
                <label>
                    Receive Push Notifications:
                    <select
                        name="pushNotifications"
                        value={settings.pushNotifications || "yes"}
                        onChange={handleChange}
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>

                {/* Security Settings */}
                <h2>Security Settings</h2>
                <label>
                    Change Password:
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter new password"
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Two-Factor Authentication:
                    <select
                        name="twoFactorAuth"
                        value={settings.twoFactorAuth || "disabled"}
                        onChange={handleChange}
                    >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </label>

                {/* Privacy Settings */}
                <h2>Privacy Settings</h2>
                <label>
                    Profile Visibility:
                    <select
                        name="profileVisibility"
                        value={settings.profileVisibility || "public"}
                        onChange={handleChange}
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                    </select>
                </label>
                <label>
                    Data Sharing:
                    <select
                        name="dataSharing"
                        value={settings.dataSharing || "enabled"}
                        onChange={handleChange}
                    >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </label>

                {/* Save Button */}
                <button type="button" onClick={handleSave}>
                    Save Settings
                </button>
            </form>
        </div>
    );
};

export default Settings;