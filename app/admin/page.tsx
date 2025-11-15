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
    if (!loading && userData?.role !== "admin") {
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

  if (userData?.role !== "admin") {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Content className="flex items-center justify-center py-20">
          <Result
            status="403"
            title="403"
            subTitle="У вас нет доступа к этой странице."
            extra={
              <Button type="primary" onClick={() => router.push("/")}>
                На главную
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

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
      <Content className="max-w-7xl mx-auto px-4 py-8">
        <Card className="shadow-lg border-0 rounded-xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 text-gray-900 flex items-center gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
              Панель администратора
            </h1>
            <p className="text-gray-600">Управление курсами, тестами и пользователями</p>
          </div>
          <Tabs defaultActiveKey="courses" items={tabItems} size="large" />
        </Card>
      </Content>
    </Layout>
  );
}

