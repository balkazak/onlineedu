"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Select, message, Layout, Row, Col, Tag } from "antd";
import { VideoCameraOutlined, PhoneOutlined, MessageOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

const { Content } = Layout;
const { TextArea } = Input;
const { Option } = Select;

interface PricingPlan {
  id: string;
  nameKz: string;
  nameRu: string;
  durationKz: string;
  durationRu: string;
  price: number;
  originalPrice?: number;
  featuresKz: {
    included: string[];
    excluded: string[];
  };
  featuresRu: {
    included: string[];
    excluded: string[];
  };
  highlighted?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "bil-online-5",
    nameKz: "БИЛ online",
    nameRu: "БИЛ online",
    durationKz: "5 айл",
    durationRu: "5 месяцев",
    price: 69000,
    originalPrice: 125000,
    featuresKz: {
      included: [
        "БИЛ емтихасына дейінгі дайындық",
        "Аптасына 2 рет тіркелей өфір",
        "24/7 қолжетімділік",
        "Кураторлық жүйе",
        "Ай сайынғы байланау сынақтары",
        "Қосымша материалдар",
        "Математика, логика, қазақ тілі видео сабақтары"
      ],
      excluded: []
    },
    featuresRu: {
      included: [
        "Подготовка к экзамену БИЛ",
        "2 раза в неделю прямой эфир",
        "Доступ 24/7",
        "Система кураторства",
        "Ежемесячные контрольные тесты",
        "Дополнительные материалы",
        "Видеоуроки по математике, логике, казахскому языку"
      ],
      excluded: []
    }
  },
  {
    id: "hsm-online-3",
    nameKz: "НЗМ online",
    nameRu: "НЗМ online",
    durationKz: "3 ай",
    durationRu: "3 месяца",
    price: 42000,
    originalPrice: 75000,
    featuresKz: {
      included: [
        "НЗМ емтихасына дейінгі дайындық",
        "Аптасына 2 рет тіркелей өфір",
        "24/7 қолжетімділік",
        "Кураторлық жүйе",
        "Ай сайынғы байланау сынақтары",
        "Қосымша материалдар",
        "Математика, сандық сипаттама, жараттылсатану видео сабақтары"
      ],
      excluded: []
    },
    featuresRu: {
      included: [
        "Подготовка к экзамену НЗМ",
        "2 раза в неделю прямой эфир",
        "Доступ 24/7",
        "Система кураторства",
        "Ежемесячные контрольные тесты",
        "Дополнительные материалы",
        "Видеоуроки по математике, цифровой грамотности, естествознанию"
      ],
      excluded: []
    }
  },
  {
    id: "math-bil-hsm",
    nameKz: "Математика БИЛ-НЗМ",
    nameRu: "Математика БИЛ-НЗМ",
    durationKz: "Бір рет",
    durationRu: "Один раз",
    price: 19000,
    originalPrice: 53000,
    featuresKz: {
      included: [
        "24/7 қолжетімділік",
        "53 тақырыптық видео",
        "Әр тақырыпқа 15 сұрақтық тест",
        "1 жылға қолжетімділік"
      ],
      excluded: []
    },
    featuresRu: {
      included: [
        "Доступ 24/7",
        "53 видеоурока по темам",
        "15 вопросов тестирования по каждой теме",
        "Доступ на 1 год"
      ],
      excluded: []
    }
  },
  {
    id: "logic-bil",
    nameKz: "Логика (БИЛ)",
    nameRu: "Логика (БИЛ)",
    durationKz: "Бір рет",
    durationRu: "Один раз",
    price: 14900,
    originalPrice: 20000,
    featuresKz: {
      included: [
        "24/7 қолжетімділік",
        "20 тақырыптық видео",
        "Әр тақырыпқа 15 сұрақтық тест",
        "1 жылға қолжетімділік"
      ],
      excluded: []
    },
    featuresRu: {
      included: [
        "Доступ 24/7",
        "20 видеоуроков по темам",
        "15 вопросов тестирования по каждой теме",
        "Доступ на 1 год"
      ],
      excluded: []
    }
  },
  {
    id: "bil-paket",
    nameKz: "БИЛ пакет",
    nameRu: "БИЛ пакет",
    durationKz: "Бір рет",
    durationRu: "Один раз",
    price: 29900,
    originalPrice: 76000,
    featuresKz: {
      included: [
        "24/7 қолжетімділік",
        "20 тақырыптық видео",
        "Әр тақырыпқа 15 сұрақтық тест",
        "1 жылға қолжетімділік"
      ],
      excluded: []
    },
    featuresRu: {
      included: [
        "Доступ 24/7",
        "20 видеоуроков по темам",
        "15 вопросов тестирования по каждой теме",
        "Доступ на 1 год"
      ],
      excluded: []
    }
  }
];

export default function PricingPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  const isKz = language === "kz";

  const onFinish = async (values: {
    phone: string;
    plan: string;
    comment?: string;
  }) => {
    setLoading(true);
    try {
      // Build Russian-labeled payload so Formspree email shows Russian field names
      const plan = pricingPlans.find((p) => p.id === values.plan);
      const planName = plan ? (isKz ? plan.nameKz : plan.nameRu) : values.plan;
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
                      {isKz ? plan.nameKz : plan.nameRu}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">{isKz ? plan.durationKz : plan.durationRu}</p>
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
                      {(isKz ? plan.featuresKz.included : plan.featuresRu.included).map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircleOutlined className="text-lg mt-1 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {(isKz ? plan.featuresKz.excluded : plan.featuresRu.excluded).map((feature: string, index: number) => (
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
                  <Form.Item name="plan" label={isKz ? "Тариф" : "Тариф"} rules={[{ required: true, message: isKz ? "Тарифты таңдаңыз" : "Выберите тариф" }]}>
                    <Select placeholder={isKz ? "Тарифты таңдаңыз" : "Выберите тариф"} className="border-teal-300" style={{ textAlign: "center" }}>
                      {pricingPlans.map((plan) => (
                        <Option key={plan.id} value={plan.id}>
                          {isKz ? plan.nameKz : plan.nameRu}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="comment" label={isKz ? "Пікір (міндетті емес)" : "Комментарий (необязательно)"}>
                    <TextArea rows={3} placeholder={isKz ? "Пікіріңіз немесе сұрақыңызды қалдырыңыз..." : "Оставьте комментарий или вопрос..."} showCount maxLength={300} style={{ textAlign: "center" }} />
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

