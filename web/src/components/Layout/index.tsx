import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Providers from "./providers";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="grow">
        <div className="py-8">
          <Providers>
            <Outlet />
          </Providers>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
