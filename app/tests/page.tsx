"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spin, Empty, Tag, Badge } from "antd";
import { FileTextOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getAllTests } from "@/lib/api";
import { Test } from "@/lib/types";
import Header from "@/components/Header";
import { Layout } from "antd";
import Loader from "@/components/Loader";

const { Content, Footer } = Layout;

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { userData, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading) {
      loadTests();
    }
  }, [userLoading]);

  const loadTests = async () => {
    setLoading(true);
    const allTests = await getAllTests();
    
    if (userData?.role === "student") {
      const availableTests = allTests.filter(test => 
        !test.allowedUsers || test.allowedUsers.length === 0 || test.allowedUsers.includes(userData.email)
      );
      setTests(availableTests);
    } else {
      setTests(allTests);
    }
    setLoading(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ч ${mins} мин`;
    }
    return `${mins} мин`;
  };

  if (userLoading || loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Тесты
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              Проверьте свои знания, пройдя тесты
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {tests.length === 0 ? (
            <Empty 
              description="Тесты пока не добавлены" 
              className="py-20"
            />
          ) : (
            <Row gutter={[24, 24]}>
              {tests.map((test) => (
                <Col xs={24} sm={12} lg={8} key={test.id}>
                  <Card
                    hoverable
                    className="h-full shadow-md hover:shadow-xl rounded-xl overflow-hidden border-0 transition-all duration-300 transform hover:-translate-y-1"
                    actions={[
                      <Button
                        type="primary"
                        icon={<FileTextOutlined />}
                        onClick={() => router.push(`/test/${test.id}`)}
                        block
                        className="h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-0"
                      >
                        Пройти тест
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900 line-clamp-2">{test.title}</span>
                        </div>
                      }
                      description={
                        <div>
                          {test.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {test.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <Badge
                              count={test.questions.length}
                              showZero
                              color="blue"
                              className="flex items-center"
                            >
                              <span className="text-gray-600">Вопросов</span>
                            </Badge>
                            <div className="flex items-center gap-1 text-gray-600">
                              <ClockCircleOutlined />
                              <span>{formatTime(test.timeLimit)}</span>
                            </div>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>
      <Footer className="text-center bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-2">© 2025 Онлайн Образование. Все права защищены.</p>
        </div>
      </Footer>
    </Layout>
  );
}

