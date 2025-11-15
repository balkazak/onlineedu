"use client";

import { Card, Descriptions, Tag, Button, Space } from "antd";
import { UserOutlined, MailOutlined, SafetyOutlined, FileTextOutlined } from "@ant-design/icons";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Layout } from "antd";

const { Content } = Layout;

export default function ProfilePage() {
  const { firebaseUser, userData } = useUser();
  const router = useRouter();

  if (!firebaseUser || !userData) {
    router.push("/login");
    return null;
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Профиль
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              Информация о вашем аккаунте
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card className="shadow-xl border-0 rounded-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                Информация о пользователе
              </h2>
            </div>
            <Descriptions bordered column={1} size="large">
              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined className="text-blue-600" />
                    <span className="font-semibold">Email</span>
                  </Space>
                }
              >
                <span className="text-gray-700">{userData.email}</span>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <SafetyOutlined className="text-blue-600" />
                    <span className="font-semibold">Роль</span>
                  </Space>
                }
              >
                <Tag color={userData.role === "admin" ? "red" : "blue"} className="text-sm font-semibold px-3 py-1">
                  {userData.role === "admin" ? "Администратор" : "Студент"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined className="text-blue-600" />
                    <span className="font-semibold">Доступные курсы</span>
                  </Space>
                }
              >
                {userData.allowedCourses.length > 0 ? (
                  <Tag color="blue" className="text-sm font-semibold px-3 py-1">
                    {userData.allowedCourses.length} курс(ов)
                  </Tag>
                ) : (
                  <Tag color="default" className="text-sm font-semibold px-3 py-1">
                    Нет доступа к курсам
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <FileTextOutlined className="text-green-600" />
                    <span className="font-semibold">Доступные тесты</span>
                  </Space>
                }
              >
                {userData.allowedTests && userData.allowedTests.length > 0 ? (
                  <Tag color="green" className="text-sm font-semibold px-3 py-1">
                    {userData.allowedTests.length} тест(ов)
                  </Tag>
                ) : (
                  <Tag color="default" className="text-sm font-semibold px-3 py-1">
                    Нет доступа к тестам
                  </Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

