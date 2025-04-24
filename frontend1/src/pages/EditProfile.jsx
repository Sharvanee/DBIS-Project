import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./EditProfile.css";
import Navbar from "./Navbar";

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    country: "",
    state: "",
    city: "",
    college: "",
    profile_pic: null,
    display_name: "",
  });
  const [preview, setPreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`${apiUrl}/profile`, { credentials: "include" });
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        college: data.college || "",
        display_name: data.display_name || data.handle,
      }));
      setPreview(data.profile_pic);
    };

    const fetchCountries = async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
      const data = await res.json();
      setCountries(data.data.map((c) => c.name));
    };

    fetchProfile();
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      if (!form.country) return;
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: form.country }),
      });
      const data = await res.json();
      setStates(data.data.states.map((s) => s.name));
    };
    fetchStates();
  }, [form.country]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!form.country || !form.state) return;
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: form.country, state: form.state }),
      });
      const data = await res.json();
      setCities(data.data);
    };
    fetchCities();
  }, [form.state]);

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
    formData.append("country", form.country);
    formData.append("state", form.state);
    formData.append("city", form.city);
    formData.append("college", form.college);
    formData.append("display_name", form.display_name);
    if (form.profile_pic) {
      formData.append("profile_pic", form.profile_pic);
    }

    try {
      const res = await fetch(`${apiUrl}/update-profile`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        navigate("/profile");
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
            <label>Country:</label>
            <select name="country" value={form.country} onChange={handleChange}>
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>State:</label>
            <select name="state" value={form.state} onChange={handleChange}>
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>City:</label>
            <select name="city" value={form.city} onChange={handleChange}>
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
