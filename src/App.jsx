import { useState } from "react";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import BrandSignup from "./Pages/BrandSignup";
import Discover from "./Pages/Discover";
import Dashboard from "./Pages/Dashboard";
import BrandDashboard from "./Pages/BrandDashboard";

const theme = {
  bg: "#16171d",
  text: "#f3f4f6",
  muted: "#9ca3af",
  purple: "#8b5cf6",
  card: "#1f2028",
  border: "#2e303a",
  inputBg: "#111217",
  shadow: "0 14px 40px rgba(0, 0, 0, 0.22)",
  dark: true,
};

function App() {
  const [view, setView] = useState("landing");
  const [creator, setCreator] = useState(null);
  const [brand, setBrand] = useState(null);
  const [loginRole, setLoginRole] = useState("creator");

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
    );
  }

  if (view === "creatorSignup") {
    return (
      <Signup
        theme={theme}
        onBack={goHome}
        onDone={(createdCreator) => {
          setCreator(createdCreator);
          setView("creatorDashboard");
        }}
      />
    );
  }

  if (view === "brandSignup") {
    return (
      <BrandSignup
        theme={theme}
        onBack={goHome}
        onDone={(createdBrand) => {
          setBrand(createdBrand);
          setView("brandDashboard");
        }}
      />
    );
  }

  if (view === "discover") {
    return <Discover theme={theme} onBack={goHome} />;
  }

  if (view === "creatorDashboard" && creator) {
    return (
      <Dashboard
        theme={theme}
        creator={creator}
        onLogout={handleLogout}
        onDiscover={goDiscover}
      />
    );
  }

  if (view === "brandDashboard" && brand) {
    return (
      <BrandDashboard
        theme={theme}
        brand={brand}
        onLogout={handleLogout}
        onDiscover={goDiscover}
      />
    );
  }

  return (
    <Landing
      theme={theme}
      onCreator={() => setView("creatorSignup")}
      onBrand={() => setView("brandSignup")}
      onCreatorLogin={() => goLogin("creator")}
      onBrandLogin={() => goLogin("brand")}
      onDiscover={goDiscover}
    />
  );
}

export default App;
