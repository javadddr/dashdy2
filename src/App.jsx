import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Dash1 from "./Dash1";
import Login from "./Login";
import ChatAi from "./ChatAi";
import UsersE from "./UsersE";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dash1 />} />
        <Route path="/chat" element={<ChatAi />} />
        <Route path="/users" element={<UsersE />} />
      </Routes>
    </Router>
  );
}

export default App;
