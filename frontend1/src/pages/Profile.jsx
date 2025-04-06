import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if user is logged in
        const authRes = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });

        if (!authRes.ok) {
          navigate("/login");
          return;
        }

        // Fetch profile data
        const res = await fetch(`${apiUrl}/profile`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile.");
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p>Loading profile...</p>;

  if (!user) return <p>Profile not found.</p>;

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <div className="profile-info">
        <p><strong>Handle:</strong> {user.handle}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rating:</strong> {user.rating}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Problems Solved:</strong> {user.solved_count}</p>
        <p><strong>Submissions:</strong> {user.submission_count}</p>
        <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Profile;
