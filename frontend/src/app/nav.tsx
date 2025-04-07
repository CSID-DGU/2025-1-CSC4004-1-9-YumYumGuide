"use client";

import { useState } from "react";
import Link from "next/link";

const Navbar = () => {
  const [active, setActive] = useState("home");

  const navItems = [
    { name: "home", label: "홈", icon: "/icons/home.png", href: "/" },
    { name: "schedule", label: "일정", icon: "/icons/schedule.png", href: "/schedule" },
    { name: "map", label: "지도", icon: "/icons/Location.png", href: "/map" },
    { name: "profile", label: "프로필", icon: "/icons/profile.svg", href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[500px] bg-white shadow-md border-t border-gray-200 rounded-t-3xl">
      <div className="flex justify-between items-center h-[70px]">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.name}
            onClick={() => setActive(item.name)}
            className="flex flex-col items-center justify-center w-1/4"
          >
            <div className="flex flex-col items-center gap-1">
              <img
                src={item.icon}
                alt={item.label}
                className="w-6 h-6"
                style={{
                  filter: active === item.name ? "none" : "grayscale(100%) opacity(50%)",
                }}
              />
              <span
                className={`text-xs ${
                  active === item.name ? "text-[#27C289]" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;