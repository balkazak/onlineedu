"use client";

import { useState } from "react";
import { Tabs, Card } from "antd";
import { BookOutlined, FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Layout, Result, Button } from "antd";
import CoursesManagement from "@/components/admin/CoursesManagement";
import TestsManagement from "@/components/admin/TestsManagement";
import UsersManagement from "@/components/admin/UsersManagement";

const { Content } = Layout;

export default function AdminPage() {
  const { userData, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userData?.role !== "admin" && userData?.role !== "curator") {
      router.push("/");
    }
  }, [userData, loading, router]);

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Content className="flex items-center justify-center py-20">
          <div>Загрузка...</div>
        </Content>
      </Layout>
    );
  }

  if (userData?.role !== "admin" && userData?.role !== "curator") {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Content className="flex items-center justify-center py-20">
          <Result
            status="403"
            title="403"
            subTitle="У вас нет доступа к этой странице."
            extra={
              <Button type="primary" onClick={() => router.push("/")}>На главную</Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  const isCurator = userData?.role === "curator";
  
  const tabItems = [
    {
      key: "courses",
      label: (
        <span>
          <BookOutlined />
          Курсы
        </span>
      ),
      children: <CoursesManagement />,
      disabled: isCurator,
    },
    {
      key: "tests",
      label: (
        <span>
          <FileTextOutlined />
          Тесты
        </span>
      ),
      children: <TestsManagement />,
      disabled: isCurator,
    },
    {
      key: "users",
      label: (
        <span>
          <UserOutlined />
          Пользователи
        </span>
      ),
      children: <UsersManagement />,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Панель администратора
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 max-w-2xl mx-auto">
              Управление курсами, тестами и пользователями
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card className="shadow-xl border-0 rounded-2xl">
            <Tabs defaultActiveKey={userData?.role === "curator" ? "users" : "courses"} items={tabItems} size="large" />
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

