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
import Header from "./layout/Header";
import Meals from "./main_layout/Menu";
import ShippingForm from "./pages/ShippingForm";
import AdminRoute from "./admin/AdminRoute";
//import UserProtecte
import UploadNewMenu from "./admin/UploadNewMenu";
import CartModal from "./top_layout/CartModal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Spinner from "./UI/Spinner";
import PageNotFound from "./UI/PageNotFound";
import UserLanding from "./pages/UserLanding";
import UserProtectedRoutes from "./layout/UserProtectedRoutes";

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
                  <Route path="/" element={<UserLanding />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

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
