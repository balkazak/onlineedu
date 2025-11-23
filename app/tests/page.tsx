"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, Row, Col, Button, Spin, Empty, Tag, message } from "antd";
import { FileTextOutlined, ClockCircleOutlined, LockOutlined } from "@ant-design/icons";
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
  const { userData } = useUser();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    const allTests = await getAllTests();
    setTests(allTests);
    setLoading(false);
  };

  const isTestAccessible = useCallback((test: Test) => {
    if (!userData) return false;
    if (userData.role === "admin") return true;
    if (userData.role === "student") {
      if (userData.allowedTests && userData.allowedTests.length > 0) {
        return userData.allowedTests.includes(test.id || "");
      }
      if (test.allowedUsers && test.allowedUsers.length > 0) {
        return test.allowedUsers.includes(userData.email);
      }
      return true;
    }
    return false;
  }, [userData]);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ч ${mins} мин`;
    }
    return `${mins} мин`;
  }, []);

  if (loading) {
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
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Тесты
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 max-w-2xl mx-auto">
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
              {tests.map((test) => {
                const accessible = isTestAccessible(test);
                return (
                  <Col xs={24} sm={12} lg={8} key={test.id}>
                    <Card
                      hoverable
                      className="h-full shadow-md hover:shadow-xl rounded-xl overflow-hidden border-0 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                      bodyStyle={{ padding: "18px 16px 8px 16px", minHeight: 140 }}
                      actions={[
                        <Button
                          key="action"
                          type="primary"
                          icon={accessible ? <FileTextOutlined /> : <LockOutlined />}
                          onClick={() => {
                            if (!userData) {
                              message.error("Вы должны войти, чтобы пройти тест");
                              router.push("/login");
                              return;
                            }
                            if (accessible) {
                              router.push(`/test/${test.id}`);
                            } else {
                              message.error("Простите, у вас нет доступа на этот тест");
                            }
                          }}
                          style={{ padding: "0 18px", height: 36, fontSize: 15, borderRadius: 8, minWidth: 128 }}
                          className={`font-semibold border-0 m-0 ${
                            accessible
                              ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                              : "bg-gray-400 hover:bg-gray-500"
                          }`}
                        >
                          {accessible ? "Пройти тест" : "Недоступен"}
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">{test.title}</span>
                            {!accessible && userData && (
                              <Tag color="red" className="ml-2 flex-shrink-0">Недоступен</Tag>
                            )}
                          </div>
                        }
                        description={
                          <div className="pt-1">
                            {test.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[36px]">
                                {test.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs">
                              <Tag color="blue" className="text-xs">
                                {test.questions.length} вопросов
                              </Tag>
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
                );
              })}
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
}

