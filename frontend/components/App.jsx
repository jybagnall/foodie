import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartContextProvider } from "../contexts/CartContext";
import AuthContext, { AuthContextProvider } from "../contexts/AuthContext";
import Header from "./top_layout/Header";
import Meals from "./main_layout/Meals";
import ShippingForm from "./main_layout/ShippingForm";
import AdminRoute from "./admin/AdminRoute";
import UploadNewMenu from "./admin/UploadNewMenu";
import CartModal from "./top_layout/CartModal";
import Login from "./top_layout/Login";
import Signup from "./top_layout/Signup";
import ForgotPassword from "./top_layout/ForgotPassword";
import Spinner from "./UI/Spinner";
import PageNotFound from "./UI/PageNotFound";

// 로고 이미지를 public 폴더에 넣고, Cloudinary에 백업 저장해두는 방법을 쓸 것
export default function App() {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const { accessToken, isAuthLoading } = useContext(AuthContext);

  return (
    <div className="bg-gray-800">
      <div>
        <AuthContextProvider>
          <CartContextProvider>
            <Router>
              <Header />
              {isAuthLoading ? (
                <Spinner />
              ) : (
                <Routes>
                  <Route
                    path="/checkout"
                    element={
                      accessToken ? (
                        <ShippingForm />
                      ) : (
                        <Navigate to="/login" state={{ from: "/checkout" }} />
                      ) // 리디렉팅할 때의 경로를 저장해놓음
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
                  <Route path="/" element={<Meals />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/cart" element={<CartModal open={true} />} />
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              )}
            </Router>
          </CartContextProvider>
        </AuthContextProvider>
      </div>
    </div>
  );
}
