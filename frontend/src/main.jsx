import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "../components/App.jsx";
import AppProviders from "../providers/AppProviders.jsx";
import { queryClient } from "../configs/queryClient.js";

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AppProviders>
      <App />
    </AppProviders>

    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
