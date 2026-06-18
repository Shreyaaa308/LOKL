import { useState } from "react";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import BrandSignup from "./Pages/BrandSignup";
import Discover from "./Pages/Discover";
import Dashboard from "./Pages/Dashboard";
import BrandDashboard from "./Pages/BrandDashboard";

function App() {
  const [dark, setDark] = useState(false);
  const [view, setView] = useState("landing");
  const [creator, setCreator] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loginRole, setLoginRole] = useState("creator");

  const theme = {
    dark,
    bg: dark
  ? "linear-gradient(160deg, #2d1f54 0%, #3d2b6e 50%, #251a42 100%)"
  : "linear-gradient(160deg, #fdf6ff 0%, #f3ebff 50%, #faf7ff 100%)",
    card: dark ? "rgba(255,255,255,0.06)" : "white",
    border: dark ? "rgba(255,255,255,0.1)" : "#e8deff",
    text: dark ? "#f0e8ff" : "#1a0a3c",
    muted: dark ? "#a78bca" : "#7a6a9a",
    purple: "#7c4dcc",
    inputBg: dark ? "rgba(255,255,255,0.08)" : "#faf5ff",
    shadow: dark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 8px 40px rgba(124,77,204,0.08)",
  };

  const toggleBtn = (
    <button
      onClick={() => setDark((d) => !d)}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        background: dark ? "rgba(255,255,255,0.1)" : "rgba(124,77,204,0.1)",
        border: `1.5px solid ${dark ? "rgba(255,255,255,0.2)" : "#d4c5f0"}`,
        borderRadius: "50px",
        padding: "8px 16px",
        cursor: "pointer",
        fontSize: "14px",
        color: dark ? "#f0e8ff" : "#7c4dcc",
        fontWeight: "700",
      }}
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );

  const goHome = () => setView("landing");
  const goDiscover = () => setView("discover");
  const goLogin = (role) => {
    setLoginRole(role);
    setView("login");
  };
  const handleLogout = () => {
    setCreator(null);
    setBrand(null);
    setView("landing");
  };

  if (view === "login") {
    return (
      <div>
        {toggleBtn}
        <Login
          theme={theme}
          initialRole={loginRole}
          onBack={goHome}
          onSignup={(role) => setView(role === "creator" ? "creatorSignup" : "brandSignup")}
          onCreatorLogin={(loggedInCreator) => {
            setCreator(loggedInCreator);
            setView("creatorDashboard");
          }}
          onBrandLogin={(loggedInBrand) => {
            setBrand(loggedInBrand);
            setView("brandDashboard");
          }}
        />
      </div>
    );
  }

  if (view === "creatorSignup") {
    return (
      <div>
        {toggleBtn}
        <Signup
          theme={theme}
          onBack={goHome}
          onDone={(createdCreator) => {
            setCreator(createdCreator);
            setView("creatorDashboard");
          }}
        />
      </div>
    );
  }

  if (view === "brandSignup") {
    return (
      <div>
        {toggleBtn}
        <BrandSignup
          theme={theme}
          onBack={goHome}
          onDone={(createdBrand) => {
            setBrand(createdBrand);
            setView("brandDashboard");
          }}
        />
      </div>
    );
  }

  if (view === "discover") {
    return (
      <div>
        {toggleBtn}
        <Discover theme={theme} onBack={goHome} />
      </div>
    );
  }

  if (view === "creatorDashboard" && creator) {
    return (
      <div>
        {toggleBtn}
        <Dashboard
          theme={theme}
          creator={creator}
          onLogout={handleLogout}
          onDiscover={goDiscover}
        />
      </div>
    );
  }

  if (view === "brandDashboard" && brand) {
    return (
      <div>
        {toggleBtn}
        <BrandDashboard
          theme={theme}
          brand={brand}
          onLogout={handleLogout}
          onDiscover={goDiscover}
        />
      </div>
    );
  }

  return (
    <div>
      {toggleBtn}
      <Landing
        theme={theme}
        onCreator={() => setView("creatorSignup")}
        onBrand={() => setView("brandSignup")}
        onCreatorLogin={() => goLogin("creator")}
        onBrandLogin={() => goLogin("brand")}
        onDiscover={goDiscover}
      />
    </div>
  );
}

export default App;