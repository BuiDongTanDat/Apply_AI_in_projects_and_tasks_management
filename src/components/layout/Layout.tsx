import { AppSidebar } from "@/components/layout/Sidebar";
import AppHeader from "@/components/layout/Header";
import { useSidebar, SidebarProvider } from "@/context/SidebarContext";
import { ReactNode } from "react";

function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;
  return (
    <div
      onClick={toggleMobileSidebar}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
    />
  );
}

type LayoutInnerProps = {
  children: ReactNode;
};

function LayoutInner({ children }: LayoutInnerProps) {
  const { isExpanded, isMobileOpen, isHovered, isMobile } = useSidebar();

  const sidebarWidth = isExpanded || isHovered ? 260 : 60;
  // const desktopGap = 8; // Tailwind spacing 5 (px)

  return (
    <div className="relative flex min-h-screen bg-transparent text-foreground">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ease-in-out w-full min-w-0`}
        style={
          !isMobile
            ? {
                marginLeft: sidebarWidth, // chỉ marginLeft để sát sidebar
                // paddingTop: desktopGap, // bỏ padding top nếu muốn sát header
                // paddingRight: desktopGap, // bỏ padding phải
              }
            : undefined
        }
      >
        <AppHeader />
        <div className="flex-1 w-full p-0">
          {children}
        </div>
      </div>
    </div>
  );
}

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  // Bọc LayoutInner bằng SidebarProvider để context luôn có giá trị
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}