"use client";

import { useState, useMemo, useCallback } from "react";
import { Button, Avatar, Dropdown, Space, Badge } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  CloseOutlined,
  FileTextOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, userData, logout } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
    setMobileMenuOpen(false);
  }, [logout, router]);

  const userMenuItems = useMemo(() => [
    {
      key: "profile",
      icon: <UserOutlined />, 
      label: t("profile"),
      onClick: () => {
        router.push("/profile");
        setMobileMenuOpen(false);
      },
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />, 
      label: t("logout"),
      onClick: handleLogout,
    },
  ], [t, router, handleLogout]);

  const navLinks = useMemo(() => {
    const links = [
      { href: "/", label: t("home"), icon: <HomeOutlined /> },
      { href: "/courses", label: t("courses"), icon: <BookOutlined /> },
      { href: "/tests", label: t("tests"), icon: <FileTextOutlined /> },
    ];
    if (userData?.role === "admin") {
      links.push({ href: "/admin", label: t("admin"), icon: <SettingOutlined /> });
    }
    return links;
  }, [userData?.role, t]);

  const languageMenuItems = useMemo(() => [
    {
      key: "ru",
      label: "Русский",
      onClick: () => setLanguage("ru"),
    },
    {
      key: "kz",
      label: "Қазақша",
      onClick: () => setLanguage("kz"),
    },
  ], [setLanguage]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg">
                <BookOutlined className="text-white text-lg" />
              </div>
              {/* Лого и фирменное название */}
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BIL <span className="text-blue-400">NIS</span>
              </span>
            </Link>

            <nav className="hidden md:flex md:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href === "/" && pathname === "/") || (link.href === "/courses" && pathname.startsWith("/course")) || (link.href === "/tests" && pathname.startsWith("/test"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-2 border-blue-500"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className={`text-base ${isActive ? "text-white" : ""}`}>{link.icon}</span>
                    <span className={isActive ? "text-white" : ""}>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight" trigger={['click']}>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300">
                <GlobalOutlined className="text-gray-600" />
                <span className="hidden sm:block text-sm font-semibold text-gray-700">
                  {language === "ru" ? "РУ" : "ҚЗ"}
                </span>
              </button>
            </Dropdown>

            {userData || firebaseUser ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300">
                  <Avatar 
                    size="default" 
                    icon={<UserOutlined />}
                    className="bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm"
                  />
                  <span className="hidden sm:block text-sm font-semibold text-gray-700">
                    {userData?.email?.split("@")[0] || firebaseUser?.email?.split("@")[0] || t("user")}
                  </span>
                </button>
              </Dropdown>
            ) : (
              <Space className="hidden sm:flex" size="middle">
                <Button 
                  type="text" 
                  onClick={() => router.push("/login")}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  {t("login")}
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700 shadow-md font-semibold"
                >
                  {t("register")}
                </Button>
              </Space>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseOutlined className="text-lg" /> : <MenuOutlined className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/" && pathname === "/") || (link.href === "/courses" && pathname.startsWith("/course")) || (link.href === "/tests" && pathname.startsWith("/test"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg border-2 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className={`text-lg ${isActive ? "text-white" : ""}`}>{link.icon}</span>
                  <span className={isActive ? "text-white" : ""}>{link.label}</span>
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
                  {t("login")}
                </Button>
                <Button 
                  type="primary" 
                  block
                  onClick={() => {
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-md font-semibold"
                >
                  {t("register")}
                </Button>
              </div>
            )}
            {(userData || firebaseUser) && (
              <div className="pt-2">
                <Button 
                  block
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  {t("logout")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
