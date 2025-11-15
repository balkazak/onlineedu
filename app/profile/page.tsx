"use client";

import { Card, Descriptions, Tag, Button, Space } from "antd";
import { UserOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
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
      <Content className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <h1 className="text-3xl font-bold mb-6">Профиль</h1>
          <Descriptions bordered column={1}>
            <Descriptions.Item
              label={
                <Space>
                  <MailOutlined />
                  Email
                </Space>
              }
            >
              {userData.email}
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <SafetyOutlined />
                  Роль
                </Space>
              }
            >
              <Tag color={userData.role === "admin" ? "red" : "blue"}>
                {userData.role === "admin" ? "Администратор" : "Студент"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <Space>
                  <UserOutlined />
                  Доступные курсы
                </Space>
              }
            >
              {userData.allowedCourses.length > 0 ? (
                <div>
                  <Tag color="green">{userData.allowedCourses.length} курс(ов)</Tag>
                </div>
              ) : (
                <Tag color="default">Нет доступа к курсам</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Content>
    </Layout>
  );
}

