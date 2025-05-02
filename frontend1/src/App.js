import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import ProblemSet from "./pages/ProblemSet";
import Problem from "./pages/Problem";
import Contests from "./pages/ContestList";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";
import Submission from "./pages/Submission";
import AddContest from "./pages/AddContest";
import EditProfile from "./pages/EditProfile";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import BlogForm from "./pages/BlogForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/problem-set" element={<ProblemSet />} />
      <Route path="/problem/:id" element={<Problem />} />
      <Route path="/contest/:id" element={<Contest />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/submission/:id" element={<Submission />} />
      <Route path="/add-contest" element={<AddContest />} />
      <Route path="edit-profile" element={<EditProfile />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="/blogs/:id" element={<BlogDetail />} />
      <Route path="/add-blog" element={<BlogForm />} />
    </Routes>
  );
}

export default App;