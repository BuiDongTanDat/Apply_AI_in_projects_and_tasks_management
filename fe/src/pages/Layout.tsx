import { Outlet } from "react-router";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useNotifications } from "@/hooks/logic/useNotifications";

const Layout = () => {
  useNotifications();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          <div className="container mx-auto p-3">
            {/* Page Content */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
