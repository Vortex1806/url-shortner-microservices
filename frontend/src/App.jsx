import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import AppLayout from "./layouts/app-layouts";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import LinkPage from "./pages/LinkPage";
import RedirectLinkPage from "./pages/RedirectLinkPage";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/auth",
        element: <AuthPage />,
      },
      {
        path: "/link/:id",
        element: <LinkPage />,
      },
      {
        path: "/:id",
        element: <RedirectLinkPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
