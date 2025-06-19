import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login.tsx";
import GlobalErrorPage from "./pages/global-error.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import DashboardLayout from "./pages/Dashboard/layout.tsx";
import Dashboard from "./pages/Dashboard/index.tsx";
import Meals from "./pages/Dashboard/meals.tsx";
import Clients from "./pages/Dashboard/clients.tsx";
import { Toaster } from "sonner";
import ClientHistory from "./pages/Dashboard/client/client-history.tsx";
import UsersPage from "./pages/Dashboard/users.tsx";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing publishable key.");
}

const router = createBrowserRouter([
  {
    path: "*",
    element: <GlobalErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "meals",
        element: <Meals />,
      },
      {
        path: "clients",
        element: <Clients />,
      },
      {
        path: "history",
        element: <ClientHistory />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/login"
    >
      <RouterProvider router={router} />
      <Toaster position="top-center" className="text-orange-400" />
    </ClerkProvider>
  // </StrictMode>
);
