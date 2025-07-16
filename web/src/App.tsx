import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import { ProtectedRoute } from "@/components";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={
            <ProtectedRoute message="请先登录查看购物车">
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute message="请先登录进行结算">
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={
            <ProtectedRoute message="请先登录查看个人资料">
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute message="请先登录查看订单详情">
              <OrderDetail />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
