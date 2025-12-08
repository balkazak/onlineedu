"use client";

import { Card, Button, Layout } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const { Content } = Layout;

export default function TrialTestPage() {
  const router = useRouter();

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content className="max-w-5xl mx-auto px-4 py-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/")}
          className="mb-6 border-none shadow-md bg-teal-600 text-white hover:bg-teal-700 hover:text-white px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2"
        >
          Назад на главную
        </Button>

        <Card className="shadow-xl border-0 rounded-2xl p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Пробный тест
          </h1>
          <p className="text-xl text-gray-600">
            ЗДЕСЬ СКОРО БУДЕТ ПРОБНЫЙ ТЕСТ
          </p>
        </Card>
      </Content>
    </Layout>
  );
}

