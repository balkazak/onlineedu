"use client";

import { useState } from "react";
import { Button, Avatar, Dropdown, Space, Badge } from "antd";
import { 
  HomeOutlined, 
  BookOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, userData, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Профиль",
      onClick: () => {
        router.push("/profile");
        setMobileMenuOpen(false);
      },
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Выйти",
      onClick: async () => {
        await logout();
        router.push("/");
        setMobileMenuOpen(false);
      },
    },
  ];

  const navLinks = [
    { href: "/", label: "Главная", icon: <HomeOutlined /> },
    { href: "/", label: "Курсы", icon: <BookOutlined /> },
    { href: "/tests", label: "Тесты", icon: <FileTextOutlined /> },
  ];

  if (userData?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Админка", icon: <SettingOutlined /> });
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <BookOutlined className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Онлайн Образование
              </span>
            </Link>

            <nav className="hidden md:flex md:ml-10 md:space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href === "/" && pathname === "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {userData || firebaseUser ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />}
                    className="bg-gradient-to-br from-blue-500 to-indigo-500"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {userData?.email?.split("@")[0] || firebaseUser?.email?.split("@")[0] || "Пользователь"}
                  </span>
                </button>
              </Dropdown>
            ) : (
              <Space className="hidden sm:flex">
                <Button 
                  type="text" 
                  onClick={() => router.push("/login")}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Войти
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
                >
                  Регистрация
                </Button>
              </Space>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/" && pathname === "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            {!userData && !firebaseUser && (
              <div className="pt-2 space-y-2">
                <Button 
                  block
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  Войти
                </Button>
                <Button 
                  type="primary" 
                  block
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
                >
                  Регистрация
                </Button>
              </div>
            )}
            {(userData || firebaseUser) && (
              <div className="pt-2">
                <Button 
                  block
                  icon={<LogoutOutlined />}
                  onClick={async () => {
                    await logout();
                    router.push("/");
                    setMobileMenuOpen(false);
                  }}
                >
                  Выйти
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
