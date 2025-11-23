"use client";

import { useState } from "react";
import { Card, Input, Button, Table, Tag, Layout, Form, Row, Col, message } from "antd";
import { SearchOutlined, CalculatorOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const { Content } = Layout;

interface School {
  name: string;
  total: number;
  totalMin: number;
}

const schools: School[] = [
  { name: "Almaty FM", total: 1270.2, totalMin: 1200 },
  { name: "Almaty XB", total: 1200.5, totalMin: 1130 },
  { name: "Aqtau XB", total: 1050.3, totalMin: 980 },
  { name: "Aqtobe FM", total: 1100.8, totalMin: 1040 },
  { name: "Astana IB", total: 1339.9, totalMin: 1270 },
  { name: "Astana FM", total: 1250.1, totalMin: 1180 },
  { name: "Atyrau FM", total: 1080.5, totalMin: 1020 },
  { name: "Karagandy XB", total: 1120.3, totalMin: 1060 },
  { name: "Kokwetau FM", total: 1090.2, totalMin: 1030 },
  { name: "Kostanay FM", total: 1110.4, totalMin: 1050 },
  { name: "Kyzylorda FM", total: 1070.6, totalMin: 1010 },
  { name: "Oral FM", total: 1040.7, totalMin: 990 },
  { name: "Oskemen FM", total: 1105.9, totalMin: 1045 },
  { name: "Pavlodar FM", total: 1095.1, totalMin: 1035 },
  { name: "Petropavl FM", total: 1030.2, totalMin: 894 },
  { name: "Semei FM", total: 1085.4, totalMin: 1025 },
  { name: "Shymkent FM", total: 1130.6, totalMin: 1070 },
  { name: "Shymkent XB", total: 1150.8, totalMin: 1090 },
  { name: "Taldyqorgan", total: 1060.3, totalMin: 1000 },
  { name: "Taraz", total: 1075.5, totalMin: 1015 },
  { name: "Turkistan", total: 1055.7, totalMin: 995 },
];

export default function NZMCalculatorPage() {
  const [form] = Form.useForm();
  const [results, setResults] = useState<School[]>([]);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  const onFinish = (values: {
    mathematics: string | number;
    naturalScience: string | number;
    russian: string | number;
    numericalCharacteristics: string | number;
    kazakh: string | number;
    english: string | number;
  }) => {
    const total = 
      (Number(values.mathematics) || 0) +
      (Number(values.naturalScience) || 0) +
      (Number(values.russian) || 0) +
      (Number(values.numericalCharacteristics) || 0) +
      (Number(values.kazakh) || 0) +
      (Number(values.english) || 0);

    setTotalScore(total);

    const availableSchools = schools.filter(
      (school) => total >= school.totalMin
    ).sort((a, b) => b.totalMin - a.totalMin);

    setResults(availableSchools);
    setShowResults(true);

    if (availableSchools.length === 0) {
      message.warning("К сожалению, с таким баллом нет доступных школ");
    } else {
      message.success(`Найдено ${availableSchools.length} доступных школ`);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setResults([]);
    setTotalScore(null);
    setShowResults(false);
  };

  const columns = [
    {
      title: "Школа",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Итого",
      dataIndex: "total",
      key: "total",
      render: (value: number) => (
        <span className="font-medium">{value.toFixed(1)}</span>
      ),
      sorter: (a: School, b: School) => a.total - b.total,
    },
    {
      title: "Итого_min",
      dataIndex: "totalMin",
      key: "totalMin",
      render: (value: number) => (
        <Tag color="blue" className="font-semibold">
          {value}
        </Tag>
      ),
      sorter: (a: School, b: School) => a.totalMin - b.totalMin,
    },
    {
      title: "Статус",
      key: "status",
      render: (_: any, record: School) => {
        if (totalScore && totalScore >= record.totalMin) {
          return (
            <Tag color="green" className="font-semibold">
              Доступна
            </Tag>
          );
        }
        return (
          <Tag color="red" className="font-semibold">
            Недоступна
          </Tag>
        );
      },
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/")}
              className="mb-4 border-none bg-white/20 text-white hover:bg-white/30"
            >
              Назад
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <CalculatorOutlined className="text-3xl" />
              <h1 className="text-4xl md:text-5xl font-bold">
                НЗМ Калькулятор
              </h1>
            </div>
            <p className="text-xl text-teal-100">
              Осы нәтижеммен қайда грантқа түсе аламын?
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="shadow-xl border-0 rounded-2xl mb-6">
            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              className="w-full"
            >
              <Row gutter={[24, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Математика (макс: 400)"
                    name="mathematics"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value === "") return Promise.resolve();
                          const num = Number(value);
                          if (isNaN(num) || num < 0 || num > 400) {
                            return Promise.reject(new Error("Введите число от 0 до 400"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Введите балл"
                      max={400}
                      min={0}
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Сандық сипаттамалар (макс: 300)"
                    name="numericalCharacteristics"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value === "") return Promise.resolve();
                          const num = Number(value);
                          if (isNaN(num) || num < 0 || num > 300) {
                            return Promise.reject(new Error("Введите число от 0 до 300"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Введите балл"
                      max={300}
                      min={0}
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Жаратылыстану (макс: 200)"
                    name="naturalScience"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value === "") return Promise.resolve();
                          const num = Number(value);
                          if (isNaN(num) || num < 0 || num > 200) {
                            return Promise.reject(new Error("Введите число от 0 до 200"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Введите балл"
                      max={200}
                      min={0}
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Қазақ тілі (макс: 200)"
                    name="kazakh"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value === "") return Promise.resolve();
                          const num = Number(value);
                          if (isNaN(num) || num < 0 || num > 200) {
                            return Promise.reject(new Error("Введите число от 0 до 200"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Введите балл"
                      max={200}
                      min={0}
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Орыс тілі (макс: 200)"
                    name="russian"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value === "") return Promise.resolve();
                          const num = Number(value);
                          if (isNaN(num) || num < 0 || num > 200) {
                            return Promise.reject(new Error("Введите число от 0 до 200"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Введите балл"
                      max={200}
                      min={0}
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Ағылшын тілі (макс: 200)"
                    name="english"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value || value === "") return Promise.resolve();
                          const num = Number(value);
                          if (isNaN(num) || num < 0 || num > 200) {
                            return Promise.reject(new Error("Введите число от 0 до 200"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      type="number"
                      placeholder="Введите балл"
                      max={200}
                      min={0}
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex gap-4 mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  size="large"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none shadow-lg rounded-lg font-semibold px-8"
                >
                  Тексеру
                </Button>
                {showResults && (
                  <Button
                    onClick={resetForm}
                    size="large"
                    className="rounded-lg font-semibold"
                  >
                    Очистить
                  </Button>
                )}
              </div>
            </Form>
          </Card>

          {showResults && (
            <Card className="shadow-xl border-0 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  Результаты расчета
                </h2>
                <p className="text-gray-600 mb-4">
                  Ваш общий балл: <span className="font-bold text-xl text-teal-600">{totalScore?.toFixed(1)}</span>
                </p>
                <p className="text-gray-600">
                  Доступных школ: <span className="font-bold text-green-600">{results.length}</span> из {schools.length}
                </p>
              </div>

              {results.length > 0 ? (
                <Table
                  dataSource={results}
                  columns={columns}
                  rowKey="name"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Всего ${total} школ`,
                  }}
                  className="rounded-lg overflow-hidden"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    К сожалению, с вашим баллом нет доступных школ
                  </p>
                  <p className="text-gray-400 mt-2">
                    Минимальный проходной балл: {Math.min(...schools.map(s => s.totalMin))}
                  </p>
                </div>
              )}
            </Card>
          )}

          {!showResults && (
            <Card className="shadow-xl border-0 rounded-2xl">
              <div className="text-center py-8">
                <CalculatorOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Введите ваши баллы
                </h3>
                <p className="text-gray-500">
                  Заполните форму выше, чтобы узнать, в какие школы вы можете поступить
                </p>
              </div>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
}

