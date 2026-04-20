import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartContextProvider } from "../contexts/CartContext";
import { AuthContextProvider } from "../contexts/AuthContext";
import { SidebarContextProvider } from "../contexts/SidebarContext";
import AdminRoute from "./routes/AdminRoute";
import UserProtectedRoutes from "./routes/UserProtectedRoutes";
import AdminLayout from "./routes/AdminLayout";
import OrderLayout from "./routes/OrderLayout";
import UserLayout from "./routes/UserLayout";
import AddressForm from "../components/pages/userDashboard/address/AddressForm";
import AdminLanding from "./admin/AdminLanding";
import AdminAccount from "./admin/AdminAccount";
import AdminInvite from "./admin/AdminInvite";
import AdminSignup from "./admin/AdminSignup";
import AddressBook from "../components/pages/userDashboard/address/AddressBook";
import DeleteAccount from "./pages/userDashboard/account/DeleteAccount";
import EditProfile from "./pages/userDashboard/account/EditProfile";
import MyAccount from "../components/pages/userDashboard/account/MyAccount";
import MyOrders from "../components/pages/userDashboard/orders/MyOrders";
import ForgotPassword from "./pages/ForgotPassword";
import Header from "./top_layout/header/Header";
import Login from "./pages/Login";
import MenuLiveView from "./admin/MenuLiveView";
import OrderConfirmation from "./user_feedback/OrderConfirmation";
import OrderDetail from "../components/pages/userDashboard/orders/OrderDetail";
import OrderPayment from "./pages/Payment/OrderPayment";
import PageNotFound from "./user_feedback/PageNotFound";
import PaymentMethod from "../components/pages/userDashboard/payment/PaymentMethod";
import Signup from "./pages/Signup";
import ShippingForm from "./pages/ShippingForm";
import StripeEventMonitor from "./admin/StripeEventMonitor";
import UploadNewMenu from "./admin/UploadNewMenu";
import UserLanding from "./pages/Home/UserLanding";
import ViewCart from "./pages/ViewCart";
import ResetPassword from "./pages/ResetPassword";

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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/my-account"
                element={
                  <UserProtectedRoutes>
                    <UserLayout />
                  </UserProtectedRoutes>
                }
              >
                <Route index element={<MyAccount />} />
                <Route path="orders/:orderId" element={<OrderDetail />} />
                <Route path="orders" element={<MyOrders />} />
                <Route path="address" element={<AddressBook />} />
                <Route path="address/new" element={<AddressForm />} />
                <Route path="address/:id/edit" element={<AddressForm />} />
                <Route path="edit/:field" element={<EditProfile />} />
                <Route path="account-deletion" element={<DeleteAccount />} />
                <Route path="payment-methods" element={<PaymentMethod />} />
              </Route>
              <Route
                path="/order"
                element={
                  <UserProtectedRoutes>
                    <OrderLayout />
                  </UserProtectedRoutes>
                }
              >
                <Route path="shipping" element={<ShippingForm />} />
                <Route path="payment/:orderId" element={<OrderPayment />} />
                <Route
                  path="completed/:orderId"
                  element={<OrderConfirmation />}
                />
              </Route>
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
                <Route path="events-monitor" element={<StripeEventMonitor />} />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </SidebarContextProvider>
        </AuthContextProvider>
      </CartContextProvider>
    </BrowserRouter>
  );
}
