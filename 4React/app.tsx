import { Routes, Route } from "react-router-dom";
import Login from "./my-react-app/Login";
import Admin from "./Admin";
import User from "./User";

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
