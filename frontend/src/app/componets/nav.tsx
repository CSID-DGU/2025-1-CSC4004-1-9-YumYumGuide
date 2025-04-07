"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [active, setActive] = useState("");

  // Set active tab based on current path
  useEffect(() => {
    if (pathname === "/") {
      setActive("home");
    } else if (pathname === "/schedule") {
      setActive("schedule");
    } else if (pathname === "/map") {
      setActive("map");
    } else if (pathname === "/profile") {
      setActive("profile");
    } else if (pathname === "/search") {
      setActive("search");
    }
  }, [pathname]);

  const navItems = [
    { name: "home", label: "홈", icon: "/icons/home.png", href: "/" },
    { name: "schedule", label: "일정", icon: "/icons/schedule.png", href: "/schedule" },
    { name: "search", label: "", icon: "/icons/search.png", href: "/search" },
    { name: "map", label: "지도", icon: "/icons/Location.png", href: "/map" },
    { name: "profile", label: "프로필", icon: "/icons/profile.svg", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full flex justify-center z-50">
      <nav 
        className="w-full max-w-[500px] bg-white shadow-lg border-t border-gray-200" 
        style={{
          borderTopLeftRadius: '30px',
          borderTopRightRadius: '30px',
          height: '80px',
          position: 'relative'
        }}
      >
        <div className="grid grid-cols-5 h-full">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              onClick={() => setActive(item.name)}
              className="flex flex-col items-center justify-center relative"
            >
              {item.name === "search" ? (
                <div className="absolute" style={{ top: '10px' }}>
                  <div className="w-14 h-14 rounded-full bg-[#27C289] flex items-center justify-center shadow-md">
                    <img
                      src={item.icon}
                      alt="검색"
                      className="w-6 h-6 object-contain"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-5 h-5 object-contain"
                      style={{
                        filter: active === item.name ? "none" : "grayscale(100%) opacity(50%)"
                      }}
                    />
                  </div>
                  <span
                    className={`text-xs ${
                      active === item.name ? "text-[#27C289] font-medium" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;