import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "./Profile.css"; // Assuming you have a CSS file for styling
import Navbar from "./Navbar";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { addDays, subDays } from 'date-fns';


const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [solvedMap, setSolvedMap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authRes = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });

        if (!authRes.ok) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${apiUrl}/profile`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile.");
        }

        const data = await res.json();
        setUser(data);

        const solvedRes = await fetch(`${apiUrl}/api/profile/submissions/daily-count`, {
          credentials: "include",
        });

        if (!solvedRes.ok) {
          console.error("Error fetching solved data:", solvedRes.statusText);
          setSolvedMap([]); // Safe fallback to empty array
          return;
        }

        const solvedData = await solvedRes.json();
        console.log("🔥 solvedData", solvedData);

        // Ensure it's always an array
        setSolvedMap(Array.isArray(solvedData) ? solvedData : []);

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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };


  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-left">
            {user.profile_pic ? (
              <img
                src={user.profile_pic}
                alt="Profile"
                className="profile-pic"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            <div
              className="initials-avatar"
              style={{
                display: user.profile_pic ? "none" : "flex",
                backgroundColor: "#ccc",
                borderRadius: "50%",
                width: "100px",
                height: "100px",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "32px",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {getInitials(user.display_name || user.handle)}
            </div>


          </div>
          <div className="profile-right">
            <h2>{user.handle}</h2>
            <p><strong>Name:</strong> {user.display_name || ""}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rating:</strong> {user.rating}</p>
            <p><strong>Problems Solved:</strong> {user.solved_count}</p>
            <p><strong>Submissions:</strong> {user.submission_count}</p>
            <p>
              <strong>Location:</strong>{" "}
              {user.city || user.state || user.country
                ? [user.city, user.state, user.country].filter(Boolean).join(", ")
                : "N/A"}
            </p>

            <p><strong>Institution:</strong> {user.college || "N/A"}</p>
            <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleString()}</p>

            <div className="profile-buttons">
              <a href="/edit-profile" className="btn secondary">Edit Profile</a>
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: "20px" }}>🗓️ Activity Heatmap</h3>

        <CalendarHeatmap
          startDate={subDays(new Date(), 365)}
          endDate={new Date()}
          values={Array.isArray(solvedMap) ? solvedMap : []}
          showWeekdayLabels={true}
          showMonthLabels={true}
          weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          classForValue={(value) => {
            if (!value || value.count === 0) return "color-empty";
            if (value.count < 2) return "color-scale-1";
            if (value.count < 5) return "color-scale-2";
            if (value.count < 10) return "color-scale-3";
            return "color-scale-4";
          }}
          tooltipDataAttrs={(value) => {
            return {
              'data-tip': value.date
                ? `${value.date}: ${value.count} solved`
                : "No activity",
            };
          }}
        />


      </div>
    </div>
  );
};

export default Profile;