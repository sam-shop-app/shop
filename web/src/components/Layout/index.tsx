import { Outlet } from "react-router-dom";
import {} from "@heroui/react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="grow">
        <div className="py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
