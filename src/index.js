import { lazy, StrictMode, Suspense } from "react";
import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";

const App = lazy(() => import("./App.js"));

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Suspense fallback="WTF!">
      <App />
    </Suspense>
  </StrictMode>,
  rootElement
);
