import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./EditProfile.css";
import Navbar from "./Navbar";

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    city: "",
    college: "",
    profile_pic: null,
    display_name: "",
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${apiUrl}/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      setForm({
        city: data.city || "",
        college: data.college || "",
        profile_pic: null,
        display_name: data.display_name || data.handle, // Default to handle if no display name exists
      });
      setPreview(data.profile_pic);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_pic" && files[0]) {
      setForm({ ...form, profile_pic: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("city", form.city);
    formData.append("college", form.college);
    formData.append("display_name", form.display_name);
    if (form.profile_pic) {
      formData.append("profile_pic", form.profile_pic);
    }

    try {
      const res = await fetch(`${apiUrl}/update-profile`, {
        method: "PUT", // Use PUT for profile updates
        body: formData, // Use FormData to send the profile picture and other fields
        credentials: "include", // include cookies (for session handling)
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        navigate("/profile"); // Redirect to the profile page to reflect changes
      } else {
        const result = await res.json();
        alert(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="edit-profile-container">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Display Name:</label>
            <input
              type="text"
              name="display_name"
              value={form.display_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>City:</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>College:</label>
            <input
              type="text"
              name="college"
              value={form.college}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Profile Picture:</label>
            <input type="file" name="profile_pic" onChange={handleChange} />
            {preview && <img src={preview} alt="Preview" className="preview-pic" />}
          </div>
          <button type="submit" className="btn">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
