import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartContextProvider } from "../contexts/CartContext";
import AuthContext, { AuthContextProvider } from "../contexts/AuthContext";
import Header from "./top_layout/Header";
import ShippingForm from "./pages/ShippingForm";
import AdminRoute from "./routes/AdminRoute";
import UploadNewMenu from "./admin/UploadNewMenu";
import CartModal from "./top_layout/CartModal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Spinner from "./user_feedback/Spinner";
import PageNotFound from "./user_feedback/PageNotFound";
import UserLanding from "./pages/Home/UserLanding";
import UserProtectedRoutes from "./routes/UserProtectedRoutes";

// 로고 이미지를 public 폴더에 넣고, Cloudinary에 백업 저장해두는 방법을 쓸 것
export default function App() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  return (
    <BrowserRouter>
      <AuthContextProvider>
        <CartContextProvider>
          <Header />

          <Routes>
            <Route path="/" element={<UserLanding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/cart" element={<CartModal open={true} />} />
            <Route
              path="/checkout"
              element={
                <UserProtectedRoutes>
                  <ShippingForm />
                </UserProtectedRoutes>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <UserProtectedRoutes>
                  <ForgotPassword />
                </UserProtectedRoutes>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <UploadNewMenu />
                </AdminRoute>
              }
            />

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </CartContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}
