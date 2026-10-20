import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ContactInboxProvider } from "./context/ContactInboxContext";
import { MessageProvider } from "./context/MessageContext";
import { ProductProvider } from "./context/ProductContext";
import { RatingProvider } from "./context/RatingContext";
import { CartProvider } from "./context/CartContext";
import { ActivityProvider } from "./context/ActivityContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProductForm from "./pages/ProductForm";
import Shop from "./pages/Shop";
import ShopProductDetails from "./pages/ShopProductDetails";
import BuyerDashboard from "./pages/BuyerDashboard";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ContactInbox from "./pages/ContactInbox";
import NotFound from "./pages/NotFound";
import ManageAccounts from "./pages/ManageAccounts";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ActivityLog from "./pages/ActivityLog";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ContactInboxProvider>
          <ActivityProvider>
          <MessageProvider>
            <ProductProvider>
              <RatingProvider>
                <CartProvider>
                  <BrowserRouter>
                    <div className="app-shell">
                      <Navbar />
                      <main className="app-main">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />

                          {/* ── ADMIN / MANAGER ── */}
                          <Route path="/dashboard" element={
                            <ProtectedRoute allowedRoles={["admin", "manager"]}><Dashboard /></ProtectedRoute>
                          } />
                          <Route path="/products" element={
                            <ProtectedRoute allowedRoles={["admin", "manager"]}><Products /></ProtectedRoute>
                          } />
                          <Route path="/products/add" element={
                            <ProtectedRoute allowedRoles={["admin"]}><ProductForm /></ProtectedRoute>
                          } />
                          <Route path="/products/edit/:id" element={
                            <ProtectedRoute allowedRoles={["admin", "manager"]}><ProductForm /></ProtectedRoute>
                          } />
                          <Route path="/products/:id" element={
                            <ProtectedRoute allowedRoles={["admin", "manager"]}><ProductDetails /></ProtectedRoute>
                          } />

                          {/* ── ADMIN ONLY ── */}
                          <Route path="/accounts" element={
                            <ProtectedRoute allowedRoles={["admin"]}><ManageAccounts /></ProtectedRoute>
                          } />
                          <Route path="/inbox" element={
                            <ProtectedRoute allowedRoles={["admin"]}><ContactInbox /></ProtectedRoute>
                          } />

                          {/* ── BUYER ── */}
                          <Route path="/buyer" element={
                            <ProtectedRoute allowedRoles={["buyer"]}><BuyerDashboard /></ProtectedRoute>
                          } />
                          <Route path="/shop" element={
                            <ProtectedRoute allowedRoles={["buyer"]}><Shop /></ProtectedRoute>
                          } />
                          <Route path="/shop/:id" element={
                            <ProtectedRoute allowedRoles={["buyer"]}><ShopProductDetails /></ProtectedRoute>
                          } />
                          <Route path="/cart" element={
                            <ProtectedRoute allowedRoles={["buyer"]}><Cart /></ProtectedRoute>
                          } />
                          <Route path="/orders" element={
                            <ProtectedRoute allowedRoles={["buyer"]}><MyOrders /></ProtectedRoute>
                          } />

                          {/* ── ANY SIGNED-IN USER ── */}
                        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                        <Route path="/profile"  element={<ProtectedRoute><Profile  /></ProtectedRoute>} />
                        <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
                        <Route path="/about"    element={<About   />} />
                        <Route path="/contact"  element={<Contact />} />
                        <Route path="*"         element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                      <BackToTop />
                      <Chatbot />
                    </div>
                  </BrowserRouter>
                </CartProvider>
              </RatingProvider>
            </ProductProvider>
          </MessageProvider>
          </ActivityProvider>
        </ContactInboxProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;