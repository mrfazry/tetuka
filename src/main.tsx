import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import "./App.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/literata/400.css";
import "@fontsource/literata/500.css";
import "@fontsource/literata/600.css";

function isPrivacyPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === "/privacy-policy";
}

function Root() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return isPrivacyPath(pathname) ? <PrivacyPolicy /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
