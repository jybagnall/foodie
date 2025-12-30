import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartContextProvider } from "../contexts/CartContext";
import { AuthContextProvider } from "../contexts/AuthContext";
import { SidebarContextProvider } from "../contexts/SidebarContext";
import Header from "./top_layout/Header";
import ShippingForm from "./pages/ShippingForm";
import AdminRoute from "./routes/AdminRoute";
import UploadNewMenu from "./admin/UploadNewMenu";
import CartModal from "./top_layout/CartModal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import PageNotFound from "./user_feedback/PageNotFound";
import UserLanding from "./pages/Home/UserLanding";
import AdminLanding from "./admin/AdminLanding";
import AdminAccount from "./admin/AdminAccount";
import UserProtectedRoutes from "./routes/UserProtectedRoutes";
import AdminLayout from "./routes/AdminLayout";
import AdminInvite from "./admin/AdminInvite";
import AdminSignup from "./admin/AdminSignup";
import MenuLiveView from "./admin/MenuLiveView";
import MyAccount from "./sidebar_layout/MyAccount";
import StripeWrapper from "./pages/Payment/StripeWrapper";
import OrderSuccess from "./user_feedback/OrderSuccess";
import UserLayout from "./routes/UserLayout";

// 로고 이미지를 public 폴더에 넣고, Cloudinary에 백업 저장해두는 방법을 쓸 것
export default function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <CartContextProvider>
          <SidebarContextProvider>
            <Header />

            <Routes>
              <Route path="/" element={<UserLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create-admin-account" element={<AdminSignup />} />
              <Route path="/cart" element={<CartModal open={true} />} />

              <Route
                path="/my-account"
                element={
                  <UserProtectedRoutes>
                    <UserLayout />
                  </UserProtectedRoutes>
                }
              >
                <Route index element={<MyAccount />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="shipping" element={<ShippingForm />} />
                <Route path="pay-order/:orderId" element={<StripeWrapper />} />
                <Route path="order-completed" element={<OrderSuccess />} />
              </Route>
              {/* 📍📍/my-account 에서 벗어난다면:
              ShippingForm 컴포넌트에서 StripeWrapper로 이동하고 있으므로 여기에서 navigate 로직을 바꿔야 함. */}

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminLanding />} />
                <Route path="new-menu" element={<UploadNewMenu />} />
                <Route path="menu-preview" element={<MenuLiveView />} />
                <Route path="invite" element={<AdminInvite />} />
                <Route path="account" element={<AdminAccount />} />
              </Route>

              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </SidebarContextProvider>
        </CartContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}
