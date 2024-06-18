import React from "react";
import "./App.css";
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
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
            onCreate={function (): void {
              throw new Error("Function not implemented.");
            }}
            initialComponent={null}
          />
        }
      />
    </>
  )
);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
