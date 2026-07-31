import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import { CartContextProvider } from "../contexts/CartContext";
import { AuthContextProvider } from "../contexts/AuthContext";
import { SidebarContextProvider } from "../contexts/SidebarContext";
import CartMergeHandler from "../components/system/CartMergeHandler";

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <CartContextProvider>
        <AuthContextProvider>
          <CartMergeHandler />
          <SidebarContextProvider>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </SidebarContextProvider>
        </AuthContextProvider>
      </CartContextProvider>
    </BrowserRouter>
  );
}
