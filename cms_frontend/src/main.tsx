import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-toastify/dist/ReactToastify.css";
import DynamicFormRenderer from "./templateForm/FormRender";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <App /> */}
    <DynamicFormRenderer />
    <ToastContainer position="top-right" autoClose={3000} />{" "}
  </React.StrictMode>
);

//pushing code for production
