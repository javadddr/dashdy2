import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Dash1 from "./Dash1";
import Login from "./Login";
import ChatAi from "./ChatAi";
import UsersE from "./UsersE";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="p-0">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dash1 />} />
          <Route path="/chat" element={<ChatAi />} />
          <Route path="/users" element={<UsersE />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
