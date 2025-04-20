// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import ProblemSet from "./pages/ProblemSet";
import Problem from "./pages/Problem";
import Contests from "./pages/Contests";
import Contest from "./pages/Contest";
import Profile from "./pages/Profile";
import Submission from "./pages/Submission";
import AddContest from "./pages/AddContest";
// import Products from "./pages/Products";
// import Cart from "./pages/Cart";
// import OrderConfirmation from "./pages/OrderConfirmation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
    </Routes>
  );
}

export default App;