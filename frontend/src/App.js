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
// import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
// import Products from "./pages/Products";
// import Cart from "./pages/Cart";
// import OrderConfirmation from "./pages/OrderConfirmation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;