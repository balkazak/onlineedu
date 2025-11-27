"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Select, message, Layout, Row, Col, Tag } from "antd";
import { VideoCameraOutlined, PhoneOutlined, MessageOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  features: {
    included: string[];
    excluded: string[];
  };
  highlighted?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "1 месяц",
    duration: "1 месяц",
    price: 11000,
    features: {
      included: [
        "1 месяц",
        "24/7 доступ к видеозанятиям"
      ],
      excluded: [
        "Тематические тесты после каждого видео",
        "Кураторское сопровождение",
        "Еженедельные практические занятия в прямом эфире",
        "Домашние задания",
        "Еженедельные контрольные тесты",
        "Ежемесячные оценочные тесты",
        "Пробные экзамены"
      ]
    }
  },
  {
    id: "annual",
    name: "Оплата за 12 месяцев",
    duration: "12 месяцев",
    price: 33000,
    originalPrice: 132000,
    features: {
      included: [
        "1 год",
        "24/7 доступ к видеозанятиям"
      ],
      excluded: [
        "Тематические тесты после каждого видео",
        "Кураторское сопровождение",
        "Еженедельные практические занятия в прямом эфире",
        "Домашние задания",
        "Еженедельные контрольные тесты",
        "Ежемесячные оценочные тесты",
        "Пробные экзамены"
      ]
    }
  }
];

export default function PricingPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: {
    phone: string;
    plan: string;
    comment?: string;
  }) => {
    setLoading(true);
    try {
      // Build Russian-labeled payload so Formspree email shows Russian field names
      const planName = pricingPlans.find((p) => p.id === values.plan)?.name || values.plan;
      const payload: Record<string, string> = {
        Телефон: values.phone || "",
        Тариф: planName,
        Комментарий: values.comment || "",
      };

      const response = await fetch("https://formspree.io/f/mjkqgwya", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.");
        form.resetFields();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при отправке заявки");
      }
    } catch (error: any) {
      message.error(error.message || "Произошла ошибка при отправке заявки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
            </div>
            <p className="text-xl text-teal-100">
              Выберите подходящий тариф для обучения
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <Row gutter={[24, 24]} className="mb-12">
            {pricingPlans.map((plan) => (
              <Col xs={24} md={12} key={plan.id}>
                <Card
                    className={`h-full shadow-xl border-0 rounded-2xl overflow-hidden bg-gray-100`}
                >
                  <div className="text-center mb-6">
                      <h2 className={`text-2xl font-bold mb-2 text-teal-800`}>
                      {plan.name}
                    </h2>
                    {plan.originalPrice && (
                      <div className="mb-2">
                          <span className={`text-lg line-through opacity-70 text-gray-500`}>
                            {plan.originalPrice.toLocaleString()} 〒
                          </span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-4xl font-bold text-teal-700`}>
                          {plan.price.toLocaleString()} 〒
                        </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                      {plan.features.included.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircleOutlined className="text-lg mt-1 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.features.excluded.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 opacity-50">
                          <CloseCircleOutlined className="text-lg mt-1 text-gray-400" />
                          <span className="text-gray-500">{feature}</span>
                        </div>
                      ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="shadow-xl border-0 rounded-2xl border-t-4 border-teal-600 p-6 mx-auto max-w-lg">
            <h2 className="text-2xl font-bold text-teal-800 mb-4 text-center">Оставить заявку</h2>
            <Form form={form} onFinish={onFinish} layout="vertical" size="middle" className="mx-auto">
              <Row gutter={[12, 8]}>
                <Col xs={24}>
                  <Form.Item
                    name="phone"
                    label="Номер телефона"
                    rules={[
                      { required: true, message: "Введите номер телефона" },
                      { pattern: /^[\d\s\-\+\(\)]+$/, message: "Введите корректный номер телефона" },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-teal-500" />}
                      placeholder="+7 (XXX) XXX-XX-XX"
                      className="border-teal-300 focus:border-teal-500"
                      style={{ textAlign: "center" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="plan" label="Тариф" rules={[{ required: true, message: "Выберите тариф" }]}>
                    <Select placeholder="Выберите тариф" className="border-teal-300" style={{ textAlign: "center" }}>
                      {pricingPlans.map((plan) => (
                        <Option key={plan.id} value={plan.id}>
                          {plan.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="comment" label="Комментарий (необязательно)">
                    <TextArea rows={3} placeholder="Оставьте комментарий или вопрос..." showCount maxLength={300} style={{ textAlign: "center" }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item className="mb-0">
                <div className="flex justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="middle"
                    className="bg-gradient-to-r from-teal-600 to-teal-700 border-none shadow rounded-md text-base font-semibold px-6"
                    icon={<MessageOutlined />}
                  >
                    Отправить
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

