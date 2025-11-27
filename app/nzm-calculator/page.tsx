"use client";

import { useState } from "react";
import { Card, Input, Button, Table, Tag, Layout, Form, Row, Col, message, Tabs } from "antd";
import { SearchOutlined, CalculatorOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

const { Content } = Layout;

interface School {
  name: string;
  total: number;
  totalMin: number;
  percentage?: number;
}

const nzmSchools: School[] = [
  { name: "Almaty FM", total: 1322.3, totalMin: 1261 },
  { name: "Almaty XB", total: 1278.9, totalMin: 1207 },
  { name: "Aqtau XB", total: 1189.2, totalMin: 1094 },
  { name: "Aqtobe FM", total: 1212.5, totalMin: 1113 },
  { name: "Astana IB", total: 1339.9, totalMin: 1270 },
  { name: "Astana FM", total: 1322.4, totalMin: 1255 },
  { name: "Atyrau FM", total: 1181.2, totalMin: 1084 },
  { name: "Karagandy XB", total: 1120.9, totalMin: 1013 },
  { name: "Kokwetau FM", total: 1142.1, totalMin: 1027 },
  { name: "Kostanay FM", total: 1054.6, totalMin: 936 },
  { name: "Kyzylorda FM", total: 1129.6, totalMin: 1016 },
  { name: "Oral FM", total: 1158.1, totalMin: 1040 },
  { name: "Oskemen FM", total: 1096.7, totalMin: 970 },
  { name: "Pavlodar FM", total: 1137.6, totalMin: 1022 },
  { name: "Petropavl FM", total: 1030.2, totalMin: 894 },
  { name: "Semei FM", total: 1054.1, totalMin: 903 },
  { name: "Shymkent FM", total: 1247.3, totalMin: 1126 },
  { name: "Shymkent XB", total: 1188.9, totalMin: 1091 },
  { name: "Taldyqorgan", total: 1170, totalMin: 1065 },
  { name: "Taraz", total: 1141.2, totalMin: 1048 },
  { name: "Turkistan", total: 1175.6, totalMin: 1080 },
];

const bilSchools: School[] = [
  { name: "Астана ұлдар БИЛ", total: 206, totalMin: 206 },
  { name: "Алматы ерлер БИЛ", total: 196, totalMin: 196 },
  { name: "Астана қыздар БИЛ", total: 171, totalMin: 171 },
  { name: "Шымкент ерлер БИЛ", total: 170, totalMin: 170 },
  { name: "Ақтөбе ерлер БИЛ", total: 169, totalMin: 169 },
  { name: "Құлсары ерлер БИЛ", total: 167, totalMin: 167 },
  { name: "Түркістан ерлер БИЛ", total: 161, totalMin: 161 },
  { name: "Атырау ерлер БИЛ", total: 161, totalMin: 161 },
  { name: "Есік ерлер БИЛ", total: 158, totalMin: 158 },
  { name: "Тараз қыздар БИЛ", total: 154, totalMin: 154 },
  { name: "Шымкент қыздар БИЛ", total: 154, totalMin: 154 },
  { name: "Талдықорған ерлер БИЛ", total: 148, totalMin: 148 },
  { name: "Тараз ерлер БИЛ", total: 146, totalMin: 146 },
  { name: "Көкшетау ерлер БИЛ", total: 145, totalMin: 145 },
  { name: "Ақтау ерлер БИЛ", total: 143, totalMin: 143 },
  { name: "Қызылорда ерлер БИЛ", total: 143, totalMin: 143 },
  { name: "Атырау қыздар БИЛ", total: 142, totalMin: 142 },
  { name: "Қарағанды ерлер БИЛ", total: 139, totalMin: 139 },
  { name: "Түркістан қыздар БИЛ", total: 135, totalMin: 135 },
  { name: "Орал ерлер БИЛ", total: 133, totalMin: 133 },
  { name: "Өскемен ерлер БИЛ", total: 130, totalMin: 130 },
  { name: "Қостанай ерлер БИЛ (RUS)", total: 129, totalMin: 129 },
  { name: "Қарағанды қыздар БИЛ", total: 125, totalMin: 125 },
  { name: "Павлодар ерлер БИЛ", total: 125, totalMin: 125 },
  { name: "Қызылорда қыздар БИЛ", total: 123, totalMin: 123 },
  { name: "Павлодар қыздар БИЛ", total: 110, totalMin: 110 },
  { name: "Жаңаөзен ерлер БИЛ", total: 110, totalMin: 110 },
  { name: "Көкшетау қыздар БИЛ", total: 105, totalMin: 105 },
  { name: "Семей ерлер БИЛ", total: 100, totalMin: 100 },
  { name: "Қызылорда БИЛ физмат", total: 96, totalMin: 96 },
  { name: "Қостанай ерлер БИЛ (KAZ)", total: 96, totalMin: 96 },
  { name: "Жезқазған ерлер БИЛ", total: 91, totalMin: 91 },
  { name: "Петропавл БИЛ", total: 91, totalMin: 91 },
  { name: "Екібастұз БИЛ", total: 91, totalMin: 91 },
  { name: "Щучинск IT БИЛ", total: 90, totalMin: 90 },
  { name: "Арыс ерлер БИЛ", total: 73, totalMin: 73 },
];

const calculateNzmPercentage = (totalScore: number, totalMin: number): number => {
  const difference = totalScore - totalMin;
  
  if (difference >= 30) return 100;
  if (difference >= 25) return 90;
  if (difference >= 20) return 85;
  if (difference >= 15) return 80;
  if (difference >= 11) return 75;
  if (difference >= 6) return 70;
  if (difference >= 1) return 65;
  if (difference === 0) return 60;
  if (difference >= -5) return 50;
  if (difference >= -10) return 40;
  if (difference >= -15) return 30;
  if (difference >= -20) return 20;
  if (difference >= -25) return 10;
  if (difference >= -30) return 5;
  return 0;
};

const calculateBilPercentage = (totalScore: number, totalMin: number): number => {
  const difference = totalScore - totalMin;
  
  if (difference >= 15) return 100;
  if (difference >= 12) return 90;
  if (difference >= 9) return 85;
  if (difference >= 6) return 80;
  if (difference >= 3) return 75;
  if (difference >= 1) return 70;
  if (difference === 0) return 60;
  if (difference >= -3) return 50;
  if (difference >= -6) return 40;
  if (difference >= -9) return 30;
  if (difference >= -11) return 20;
  if (difference >= -13) return 10;
  if (difference >= -15) return 5;
  return 0;
};

const translations = {
  ru: {
    calculator: "Калькулятор",
    back: "Назад",
    subtitle: "С этим результатом куда я могу поступить?",
    nzm: "НЗМ",
    bil: "БИЛ",
    mathematics: "Математика (макс: 400)",
    numericalCharacteristics: "Числовые характеристики (макс: 300)",
    naturalScience: "Естествознание (макс: 200)",
    kazakh: "Казахский язык (макс: 200)",
    russian: "Русский язык (макс: 200)",
    english: "Английский язык (макс: 200)",
    enterScore: "Введите балл",
    check: "Проверить",
    clear: "Очистить",
    results: "Результаты расчета",
    totalScore: "Ваш общий балл",
    availableSchools: "Доступных школ",
    from: "из",
    enterScores: "Введите ваши баллы",
    fillForm: "Заполните форму выше, чтобы узнать, в какие школы вы можете поступить",
    school: "Школа",
    percentage: "Вероятность поступления",
    totalSchools: "Всего {total} школ",
    bilScore: "Балл БИЛ",
    enterBilScore: "Введите ваш балл БИЛ",
  },
  kz: {
    calculator: "Калькулятор",
    back: "Артқа",
    subtitle: "Осы нәтижеммен қайда түсе аламын?",
    nzm: "НЗМ",
    bil: "БИЛ",
    mathematics: "Математика (макс: 400)",
    numericalCharacteristics: "Сандық сипаттамалар (макс: 300)",
    naturalScience: "Жаратылыстану (макс: 200)",
    kazakh: "Қазақ тілі (макс: 200)",
    russian: "Орыс тілі (макс: 200)",
    english: "Ағылшын тілі (макс: 200)",
    enterScore: "Балл енгізіңіз",
    check: "Тексеру",
    clear: "Тазалау",
    results: "Есептеу нәтижелері",
    totalScore: "Сіздің жалпы баллыңыз",
    availableSchools: "Қолжетімді мектептер",
    from: "дан",
    enterScores: "Баллдарыңызды енгізіңіз",
    fillForm: "Қай мектептерге түсе алатыныңызды білу үшін жоғарыдағы форманы толтырыңыз",
    school: "Мектеп",
    percentage: "Тусу ихтималдығы",
    totalSchools: "Барлығы {total} мектеп",
    bilScore: "БИЛ баллы",
    enterBilScore: "БИЛ баллыңызды енгізіңіз",
  },
};

export default function CalculatorPage() {
  const { language } = useLanguage();
  const t = (key: string) => translations[language][key as keyof typeof translations.ru] || key;
  const [nzmForm] = Form.useForm();
  const [bilForm] = Form.useForm();
  const [nzmResults, setNzmResults] = useState<School[]>([]);
  const [bilResults, setBilResults] = useState<School[]>([]);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [bilScore, setBilScore] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("nzm");
  const router = useRouter();

  const onFinishNzm = (values: {
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

    const nzmWithPercentage = nzmSchools.map(school => ({
      ...school,
      percentage: calculateNzmPercentage(total, school.totalMin)
    })).sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

    setNzmResults(nzmWithPercentage);
    setShowResults(true);
    setActiveTab("nzm");

    const availableNzm = nzmWithPercentage.filter(s => s.percentage && s.percentage >= 60).length;

    if (availableNzm === 0) {
      message.warning(language === "ru" ? "К сожалению, с таким баллом нет доступных школ" : "Өкінішке орай, мұндай баллмен қолжетімді мектептер жоқ");
    } else {
      message.success(language === "ru" ? `Найдено ${availableNzm} доступных школ` : `${availableNzm} қолжетімді мектеп табылды`);
    }
  };

  const onFinishBil = (values: { bilScore: string | number }) => {
    const score = Number(values.bilScore) || 0;
    setBilScore(score);

    const bilWithPercentage = bilSchools.map(school => ({
      ...school,
      percentage: calculateBilPercentage(score, school.totalMin)
    })).sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

    setBilResults(bilWithPercentage);
    setShowResults(true);
    setActiveTab("bil");

    const availableBil = bilWithPercentage.filter(s => s.percentage && s.percentage >= 60).length;

    if (availableBil === 0) {
      message.warning(language === "ru" ? "К сожалению, с таким баллом нет доступных школ" : "Өкінішке орай, мұндай баллмен қолжетімді мектептер жоқ");
    } else {
      message.success(language === "ru" ? `Найдено ${availableBil} доступных школ` : `${availableBil} қолжетімді мектеп табылды`);
    }
  };

  const resetForm = () => {
    nzmForm.resetFields();
    bilForm.resetFields();
    setNzmResults([]);
    setBilResults([]);
    setTotalScore(null);
    setBilScore(null);
    setShowResults(false);
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "blue";
    if (percentage >= 40) return "orange";
    if (percentage >= 20) return "volcano";
    return "red";
  };

  const getColumns = () => [
    {
      title: t("school"),
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-semibold">{text}</span>,
    },
    {
      title: t("percentage"),
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage: number) => (
        <Tag color={getPercentageColor(percentage)} className="font-semibold text-base">
          {percentage}%
        </Tag>
      ),
      sorter: (a: School, b: School) => (a.percentage || 0) - (b.percentage || 0),
      defaultSortOrder: "descend" as const,
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
              {t("back")}
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <CalculatorOutlined className="text-3xl" />
              <h1 className="text-4xl md:text-5xl font-bold">
                {t("calculator")}
              </h1>
            </div>
            <p className="text-xl text-teal-100">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-xl border-0 rounded-2xl mb-6">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "nzm",
                  label: t("nzm"),
                  children: (
                    <Form
                      form={nzmForm}
                      onFinish={onFinishNzm}
                      layout="vertical"
                      className="w-full"
                    >
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("mathematics")}
                            name="mathematics"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0 || num > 400) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите число от 0 до 400" : "0-ден 400-ге дейін сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterScore")}
                              max={400}
                              min={0}
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("numericalCharacteristics")}
                            name="numericalCharacteristics"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0 || num > 300) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите число от 0 до 300" : "0-ден 300-ге дейін сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterScore")}
                              max={300}
                              min={0}
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("naturalScience")}
                            name="naturalScience"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0 || num > 200) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите число от 0 до 200" : "0-ден 200-ге дейін сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterScore")}
                              max={200}
                              min={0}
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("kazakh")}
                            name="kazakh"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0 || num > 200) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите число от 0 до 200" : "0-ден 200-ге дейін сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterScore")}
                              max={200}
                              min={0}
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("russian")}
                            name="russian"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0 || num > 200) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите число от 0 до 200" : "0-ден 200-ге дейін сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterScore")}
                              max={200}
                              min={0}
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("english")}
                            name="english"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0 || num > 200) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите число от 0 до 200" : "0-ден 200-ге дейін сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterScore")}
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
                          {t("check")}
                        </Button>
                        {showResults && (
                          <Button
                            onClick={resetForm}
                            size="large"
                            className="rounded-lg font-semibold"
                          >
                            {t("clear")}
                          </Button>
                        )}
                      </div>
                    </Form>
                  ),
                },
                {
                  key: "bil",
                  label: t("bil"),
                  children: (
                    <Form
                      form={bilForm}
                      onFinish={onFinishBil}
                      layout="vertical"
                      className="w-full"
                    >
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={t("bilScore")}
                            name="bilScore"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (!value || value === "") return Promise.resolve();
                                  const num = Number(value);
                                  if (isNaN(num) || num < 0) {
                                    return Promise.reject(new Error(language === "ru" ? "Введите положительное число" : "Оң сан енгізіңіз"));
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder={t("enterBilScore")}
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
                          {t("check")}
                        </Button>
                        {showResults && (
                          <Button
                            onClick={resetForm}
                            size="large"
                            className="rounded-lg font-semibold"
                          >
                            {t("clear")}
                          </Button>
                        )}
                      </div>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>

          {showResults && (
            <Card className="shadow-xl border-0 rounded-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  {t("results")}
                </h2>
                {activeTab === "nzm" && totalScore !== null && (
                  <p className="text-gray-600 mb-4">
                    {t("totalScore")}: <span className="font-bold text-xl text-teal-600">{totalScore.toFixed(1)}</span>
                  </p>
                )}
                {activeTab === "bil" && bilScore !== null && (
                  <p className="text-gray-600 mb-4">
                    {t("bilScore")}: <span className="font-bold text-xl text-teal-600">{bilScore}</span>
                  </p>
                )}
                {activeTab === "nzm" && (
                  <p className="text-gray-600">
                    {t("availableSchools")} {t("nzm")}: <span className="font-bold text-green-600">{nzmResults.filter(s => s.percentage && s.percentage >= 60).length}</span> {t("from")} {nzmSchools.length}
                  </p>
                )}
                {activeTab === "bil" && (
                  <p className="text-gray-600">
                    {t("availableSchools")} {t("bil")}: <span className="font-bold text-green-600">{bilResults.filter(s => s.percentage && s.percentage >= 60).length}</span> {t("from")} {bilSchools.length}
                  </p>
                )}
              </div>

              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: "nzm",
                    label: t("nzm"),
                    children: (
                      <Table
                        dataSource={nzmResults}
                        columns={getColumns()}
                        rowKey="name"
                        pagination={false}
                        className="rounded-lg overflow-hidden"
                      />
                    ),
                  },
                  {
                    key: "bil",
                    label: t("bil"),
                    children: (
                      <Table
                        dataSource={bilResults}
                        columns={getColumns()}
                        rowKey="name"
                        pagination={false}
                        className="rounded-lg overflow-hidden"
                      />
                    ),
                  },
                ]}
              />
            </Card>
          )}

          {!showResults && (
            <Card className="shadow-xl border-0 rounded-2xl">
              <div className="text-center py-8">
                <CalculatorOutlined className="text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("enterScores")}
                </h3>
                <p className="text-gray-500">
                  {t("fillForm")}
                </p>
              </div>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
}
