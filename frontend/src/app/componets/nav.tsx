"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [active, setActive] = useState("");

  // 현재 경로에 따라 활성 탭 설정
  useEffect(() => {
    if (pathname === "/") {
      setActive("home");
    } else if (pathname === "/schedule") {
      setActive("schedule");
    } else if (pathname === "/map") {
      setActive("map");
    } else if (pathname === "/profile") {
      setActive("profile");
    }
  }, [pathname]);

  const navItems = [
    { name: "home", label: "홈", icon: "/icons/home.png", href: "/" },
    { name: "schedule", label: "일정", icon: "/icons/schedule.png", href: "/schedule" },
    { name: "map", label: "지도", icon: "/icons/Location.png", href: "/map" },
    { name: "profile", label: "프로필", icon: "/icons/profile.svg", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center w-full z-50">
      <nav className="w-full max-w-[500px] bg-white shadow-md border-t border-gray-200">
        <div className="grid grid-cols-4 h-[70px]">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              onClick={() => setActive(item.name)}
              className="flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-6 h-6 flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-5 h-5 object-contain"
                    style={{
                      filter: active === item.name ? "none" : "grayscale(100%) opacity(50%)",
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
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
