"use client";

import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Layout } from "antd";

const { Content } = Layout;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    if (!auth) {
      message.error("Firebase не настроен. Проверьте переменные окружения.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      message.success("Вход выполнен успешно!");
      router.push("/");
    } catch (error: any) {
      message.error(error.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content className="flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserOutlined className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Вход в систему
            </h1>
            <p className="text-gray-600">
              Войдите в свой аккаунт для доступа к курсам
            </p>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Введите email" },
                { type: "email", message: "Введите корректный email" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Введите пароль" },
                { min: 6, message: "Пароль должен быть не менее 6 символов" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Пароль"
              />
            </Form.Item>

            <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            >
              Войти
            </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Для регистрации обратитесь к администратору
            </p>
          </div>
        </Card>
      </Content>
    </Layout>
  );
}

