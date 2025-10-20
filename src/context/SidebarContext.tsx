// Quản lý trang thái sidebar (mở rộng, thu gọn, di động)
// Cung cấp context để các component con sử dụng trạng thái sidebar
// Xử lý sự kiện thay đổi kích thước, active item, submenu

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const DESKTOP_BREAKPOINT = 1024;

type SidebarContextType = {
    isExpanded: boolean;
    isMobileOpen: boolean;
    isMobile: boolean;
    isHovered: boolean;
    activeItem: string | null;
    openSubmenu: string | null;
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
    setIsHovered: (hovered: boolean) => void;
    setActiveItem: (item: string | null) => void;
    toggleSubmenu: (item: string) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

type SidebarProviderProps = {
    children: ReactNode;
};

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < DESKTOP_BREAKPOINT;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setIsExpanded((prev) => !prev);
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen((prev) => !prev);
    };

    const toggleSubmenu = (item: string) => {
        setOpenSubmenu((prev) => (prev === item ? null : item));
    };

    return (
        <SidebarContext.Provider
            value={{
                isExpanded: isMobile ? false : isExpanded,
                isMobileOpen,
                isMobile,
                isHovered,
                activeItem,
                openSubmenu,
                toggleSidebar,
                toggleMobileSidebar,
                setIsHovered,
                setActiveItem,
                toggleSubmenu,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};