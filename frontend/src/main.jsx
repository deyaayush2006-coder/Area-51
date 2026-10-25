import React from "react";
import ReactDOM from "react-dom/client";
import { Globals } from "@react-spring/web";
import App from "./App.jsx";
import "./index.css";

// react-spring ignores prefers-reduced-motion by default; jump straight to end states instead
Globals.assign({
  skipAnimation: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
