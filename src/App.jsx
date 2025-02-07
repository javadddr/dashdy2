import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Dash1 from "./Dash1";
import Login from "./Login";
import ChatAi from "./ChatAi";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dash1 />} />
        <Route path="/chat" element={<ChatAi />} />
      </Routes>
    </Router>
  );
}

export default App;
