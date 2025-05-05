import { FC, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
// import Footer from './Footer'; tidak terpakai

export interface LayoutProps {
  children: React.ReactNode;
  variant?: 'admin' | 'participant';
}

const Layout: FC<LayoutProps> = ({ children, variant = 'admin' }) => {
  // Tambahkan state untuk mobile sidebar
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileOpen = () => {
    console.log("Toggle mobile menu"); // update pesan debug
    setIsMobileOpen(!isMobileOpen); // toggle state
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMobileMenuClick={handleMobileOpen} />
      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileOpen}
          onMobileClose={() => {
            setIsMobileOpen(false);
            document.body.style.overflow = 'auto';
          }}
          variant={variant}
        />
        <main className="flex-1 p-4 bg-gray-50">{children}</main>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
