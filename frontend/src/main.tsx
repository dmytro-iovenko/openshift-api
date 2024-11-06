import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import MainLayout from "./layouts/MainLayout";
import Applications from "./pages/Applications";
import Deployments from "./pages/Deployments";
import ApplicationDetails from "./pages/ApplicationDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/signup",
        Component: Signup,
      },
      {
        Component: PrivateRoute,
        children: [
          {
            path: "/",
            Component: MainLayout,
            children: [
              {
                path: "",
                Component: Applications,
              },
              {
                path: "applications",
                Component: Applications,
              },
              {
                path: "applications/:slug",
                Component: ApplicationDetails,
              },
              {
                path: "deployments",
                Component: Deployments,
              },
            ],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
