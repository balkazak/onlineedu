"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Select, message, Layout, Row, Col, Tag } from "antd";
import { VideoCameraOutlined, MailOutlined, PhoneOutlined, MessageOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
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
    email: string;
    phone: string;
    plan: string;
    comment?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при отправке заявки");
      }

      message.success("Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.");
      form.resetFields();
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
                  className={`h-full shadow-xl border-0 rounded-2xl overflow-hidden ${
                    plan.id === "annual"
                      ? "bg-gradient-to-br from-teal-700 to-teal-800 text-white border-4 border-green-400"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="text-center mb-6">
                    <h2 className={`text-2xl font-bold mb-2 ${plan.id === "annual" ? "text-white" : "text-teal-800"}`}>
                      {plan.name}
                    </h2>
                    {plan.originalPrice && (
                      <div className="mb-2">
                        <span className={`text-lg line-through opacity-70 ${plan.id === "annual" ? "text-white" : "text-gray-500"}`}>
                          {plan.originalPrice.toLocaleString()} 〒
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-4xl font-bold ${plan.id === "annual" ? "text-green-300" : "text-teal-700"}`}>
                        {plan.price.toLocaleString()} 〒
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {plan.features.included.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircleOutlined
                          className={`text-lg mt-1 ${plan.id === "annual" ? "text-green-300" : "text-green-500"}`}
                        />
                        <span className={plan.id === "annual" ? "text-white" : "text-gray-700"}>
                          {feature}
                        </span>
                      </div>
                    ))}
                    {plan.features.excluded.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 opacity-50">
                        <CloseCircleOutlined
                          className={`text-lg mt-1 ${plan.id === "annual" ? "text-white/70" : "text-gray-400"}`}
                        />
                        <span className={plan.id === "annual" ? "text-white/80" : "text-gray-500"}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="shadow-xl border-0 rounded-2xl border-t-4 border-teal-600">
            <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">
              Оставить заявку
            </h2>
            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className=""
            >
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Введите email" },
                      { type: "email", message: "Введите корректный email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-teal-500" />}
                      placeholder="example@mail.com"
                      className="border-teal-300 focus:border-teal-500"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
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
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="plan"
                label="Выберите тариф"
                rules={[{ required: true, message: "Выберите тариф" }]}
              >
                <Select 
                  placeholder="Выберите тариф"
                  className="border-teal-300"
                >
                  {pricingPlans.map((plan) => (
                    <Option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price.toLocaleString()} 〒
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="comment"
                label="Комментарий (необязательно)"
              >
                <TextArea
                  rows={4}
                  placeholder="Оставьте комментарий или вопрос..."
                  showCount
                  maxLength={500}
                  className="border-teal-300 focus:border-teal-500"
                />
              </Form.Item>

              <Form.Item>
                  <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 border-none shadow-lg rounded-xl text-lg font-semibold"
                  icon={<MessageOutlined />}
                >
                  Отправить заявку
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}

