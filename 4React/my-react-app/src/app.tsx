import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Admin from "./pages/admin";
import User from "./pages/user";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/user" element={<User />} />
    </Routes>
  );
}

export default App;
