import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Login from "./login/cms.login.tsx";
import Template from "./template/Template.tsx";
import CreateTemplate from "./template/CreateTemplate.tsx";
import CreateComponent from "./components/createComponents.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} />
      <Route path="/template" element={<Template />} />
      <Route path="/create-template" element={<CreateTemplate />} />
      <Route path="/create-component" element={<CreateComponent />} />
    </>
  )
);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
