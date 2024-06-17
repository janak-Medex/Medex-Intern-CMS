import React, { Component } from "react";
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
import CreateComponent from "./components/createComponents.tsx"; // Corrected file naming convention

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Login />} />
      <Route path="/template" element={<Template />} />
      <Route path="/create-template" element={<CreateTemplate />} />
      <Route
        path="/create-component"
        element={
          <CreateComponent
            onCreate={(component: React.ComponentType) => {
              console.log("Component created:", component);
            }}
            onClose={() => {
              console.log("Close CreateComponent");
              // Handle close logic here
            }}
          />
        }
      />
    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
