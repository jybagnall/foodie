import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartContextProvider } from "../contexts/CartContext";
import { AuthContextProvider } from "../contexts/AuthContext";
import { SidebarContextProvider } from "../contexts/SidebarContext";
import Header from "./top_layout/Header";
import ShippingForm from "./pages/ShippingForm";
import AdminRoute from "./routes/AdminRoute";
import UploadNewMenu from "./admin/UploadNewMenu";
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
import UserLayout from "./routes/UserLayout";
import OrderLayout from "./routes/OrderLayout";
import OrderPayment from "./pages/Payment/OrderPayment";
import ViewCart from "./pages/ViewCart";
import OrderConfirmation from "./user_feedback/OrderConfirmation";

// 로고 이미지를 public 폴더에 넣고, Cloudinary에 백업 저장해두는 방법을 쓸 것
// 모달을 Route로 렌더링하려 하면 안됨
export default function App() {
  return (
    <BrowserRouter>
      <CartContextProvider>
        <AuthContextProvider>
          <SidebarContextProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Header />

            <Routes>
              <Route path="/" element={<UserLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create-admin-account" element={<AdminSignup />} />
              <Route path="/cart" element={<ViewCart />} />

              <Route path="/my-account" element={<UserProtectedRoutes />}>
                <Route element={<UserLayout />}>
                  <Route index element={<MyAccount />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                </Route>
              </Route>

              {/* ✅✅✅ */}
              <Route
                path="/order"
                element={
                  <UserProtectedRoutes>
                    <OrderLayout />
                  </UserProtectedRoutes>
                }
              >
                <Route path="shipping" element={<ShippingForm />} />
                <Route path="pay-order/:orderId" element={<OrderPayment />} />
                <Route
                  path="order-completed/:orderId"
                  element={<OrderConfirmation />}
                />
              </Route>

              {/* ✅✅✅ */}

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
        </AuthContextProvider>
      </CartContextProvider>
    </BrowserRouter>
  );
}
