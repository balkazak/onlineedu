"use client";

import { useState } from "react";
import { Card, Row, Col, Button, Statistic, Tag, Radio, Space, Carousel } from "antd";
import { 
  BookOutlined, 
  UserOutlined, 
  TrophyOutlined, 
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { Layout } from "antd";

const { Content, Footer } = Layout;

const demoQuestions = [
  {
    q: "2 + 2 = ?",
    options: ["3", "4", "5", "6"],
    answer: "4"
  },
  {
    q: "Столица Казахстана?",
    options: ["Алматы", "Астана", "Шымкент", "Караганда"],
    answer: "Астана"
  },
  {
    q: "Сколько планет в Солнечной системе?",
    options: ["7", "8", "9", "10"],
    answer: "8"
  }
];

export default function Home() {
  const router = useRouter();
  const { userData } = useUser();
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const isKz = language === "kz";

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === demoQuestions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < demoQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="relative">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative">
            {/* Overlay images positioned above the carousel */}
            <img src="/dostyk.jpg" alt="dostyk" className="pointer-events-none absolute top-4 left-4 w-20 h-20 md:w-28 md:h-28 object-contain z-50" />
            <img src="/newlogo.png" alt="logo" className="pointer-events-none absolute top-4 right-4 w-20 h-20 md:w-28 md:h-28 object-contain z-50" />

            <Carousel 
              autoplay 
              effect="fade" 
              className="w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
              dots={{ className: "custom-dots" }}
              arrows={true}
            >
              <div>
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100">
                  <img 
                    src="/bannernew1.png" 
                    alt="Banner 1" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100">
                  <img 
                    src="/bannernew2.jpg" 
                    alt="Banner 2" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100">
                  <img 
                    src="/banner3.jpg" 
                    alt="Banner 3" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100">
                  <img 
                    src="/banner2.webp" 
                    alt="Banner 3" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100">
                  <img 
                    src="/banner4.jpg" 
                    alt="Banner 3" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </Carousel>
          </div>
        </div>
        <div className="relative min-h-screen bg-gradient-to-b from-teal-500 via-teal-600 to-teal-700 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                {isKz ? "Онлайн білім беру платформасы" : "Онлайн платформа для обучения"}
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-10 max-w-3xl mx-auto drop-shadow-md">
                {isKz 
                  ? "Қазіргі заманғы курстар, тесттер және интерактивті оқыту" 
                  : "Современные курсы, тесты и интерактивное обучение"}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {!userData && (
                  <Button 
                    type="primary" 
                    size="large" 
                    className="bg-white text-teal-600 border-0 h-14 px-10 text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
                    onClick={() => router.push("/login")}
                  >
                    {isKz ? "Оқуды бастау" : "Начать обучение"}
                    <ArrowRightOutlined className="ml-2" />
                  </Button>
                )}
                <Button 
                  size="large" 
                  className="bg-white/20 text-white border-2 border-white h-14 px-10 text-lg font-semibold shadow-xl hover:bg-white/30 hover:scale-105 transition-all backdrop-blur-sm"
                  onClick={() => router.push("/courses")}
                >
                  {isKz ? "Курстарды көру" : "Посмотреть курсы"}
                  <PlayCircleOutlined className="ml-2" />
                </Button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
              <Row gutter={[24, 24]} className="mb-20">
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl text-center hover:scale-105 transition-transform">
                    <Statistic
                      title={<span className="text-gray-600 font-semibold">{isKz ? "Курстар" : "Курсы"}</span>}
                      value={50}
                      prefix={<BookOutlined className="text-teal-600" />}
                      valueStyle={{ color: '#14b8a6', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl text-center hover:scale-105 transition-transform">
                    <Statistic
                      title={<span className="text-gray-600 font-semibold">{isKz ? "Студенттер" : "Студенты"}</span>}
                      value={1000}
                      prefix={<UserOutlined className="text-green-600" />}
                      valueStyle={{ color: '#52c41a', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl text-center hover:scale-105 transition-transform">
                    <Statistic
                      title={<span className="text-gray-600 font-semibold">{isKz ? "Тесттер" : "Тесты"}</span>}
                      value={200}
                      prefix={<TrophyOutlined className="text-orange-600" />}
                      valueStyle={{ color: '#fa8c16', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl text-center hover:scale-105 transition-transform">
                    <Statistic
                      title={<span className="text-gray-600 font-semibold">{isKz ? "Жетістік" : "Успех"}</span>}
                      value={95}
                      suffix="%"
                      prefix={<RocketOutlined className="text-purple-600" />}
                      valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
                    />
                  </Card>
                </Col>
              </Row>

              <div className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl p-8 md:p-12 mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
                  {isKz ? "Біз туралы" : "О нас"}
                </h2>
                <Row gutter={[32, 32]}>
                  <Col xs={24} md={12}>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-teal-600 flex items-center gap-2">
                        <BookOutlined />
                        {isKz ? "Біздің миссия" : "Наша миссия"}
                      </h3>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {isKz 
                          ? "Біз әркімге сапалы білім беруге қолжетімділікті қамтамасыз етеміз. Біздің платформа заманауи технологиялар мен интерактивті оқыту әдістерін біріктіреді."
                          : "Мы делаем качественное образование доступным для всех. Наша платформа объединяет современные технологии и интерактивные методы обучения."}
                      </p>
                    </div>
                  </Col>
                  <Col xs={24} md={12}>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold text-green-600 flex items-center gap-2">
                        <RocketOutlined />
                        {isKz ? "Неге біз?" : "Почему мы?"}
                      </h3>
                      <ul className="space-y-3 text-gray-700 text-lg">
                        <li className="flex items-start gap-2">
                          <CheckCircleOutlined className="text-green-500 mt-1" />
                          <span>{isKz ? "Интерактивті оқыту материалдары" : "Интерактивные учебные материалы"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleOutlined className="text-green-500 mt-1" />
                          <span>{isKz ? "Жеке даму жоспары" : "Индивидуальный план развития"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleOutlined className="text-green-500 mt-1" />
                          <span>{isKz ? "Тәжірибелі оқытушылар" : "Опытные преподаватели"}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircleOutlined className="text-green-500 mt-1" />
                          <span>{isKz ? "24/7 қолжетімділік" : "Доступность 24/7"}</span>
                        </li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl p-8 md:p-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                  {isKz ? "Мини-тест" : "Мини-тест"}
                </h2>
                <div className="max-w-2xl mx-auto">
                  {currentQuestion < demoQuestions.length ? (
                    <div className="space-y-6">
                      <div className="bg-teal-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Tag color="blue" className="text-base px-4 py-1">
                            {isKz ? "Сұрақ" : "Вопрос"} {currentQuestion + 1} / {demoQuestions.length}
                          </Tag>
                          <Tag color="green" className="text-base px-4 py-1">
                            {isKz ? "Ұпай" : "Баллы"}: {score}
                          </Tag>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                          {demoQuestions[currentQuestion].q}
                        </h3>
                        <Radio.Group 
                          value={selectedAnswer} 
                          className="w-full"
                          disabled={showResult}
                        >
                          <Space direction="vertical" className="w-full" size="middle">
                            {demoQuestions[currentQuestion].options.map((option, idx) => {
                              const isCorrect = option === demoQuestions[currentQuestion].answer;
                              const isSelected = selectedAnswer === option;
                              let className = "w-full p-4 rounded-lg border-2 text-left transition-all";
                              
                              if (showResult) {
                                if (isCorrect) {
                                  className += " border-green-500 bg-green-50";
                                } else if (isSelected && !isCorrect) {
                                  className += " border-red-500 bg-red-50";
                                } else {
                                  className += " border-gray-200";
                                }
                              } else {
                                className += " border-gray-300 hover:border-teal-500 hover:bg-teal-50";
                              }

                              return (
                                <Radio.Button 
                                  key={idx} 
                                  value={option}
                                  className={className}
                                  onClick={() => !showResult && handleAnswer(option)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium">{option}</span>
                                    {showResult && isCorrect && (
                                      <CheckCircleOutlined className="text-green-500 text-xl" />
                                    )}
                                    {showResult && isSelected && !isCorrect && (
                                      <CloseCircleOutlined className="text-red-500 text-xl" />
                                    )}
                                  </div>
                                </Radio.Button>
                              );
                            })}
                          </Space>
                        </Radio.Group>
                        {showResult && (
                          <div className="mt-6 flex justify-end">
                            {currentQuestion < demoQuestions.length - 1 ? (
                              <Button 
                                type="primary" 
                                size="large"
                                onClick={nextQuestion}
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                {isKz ? "Келесі сұрақ" : "Следующий вопрос"}
                                <ArrowRightOutlined className="ml-2" />
                              </Button>
                            ) : (
                              <div className="w-full text-center space-y-4">
                                <div className="text-2xl font-bold text-gray-900">
                                  {isKz ? "Тест аяқталды!" : "Тест завершен!"}
                                </div>
                                <div className="text-xl text-gray-600">
                                  {isKz 
                                    ? `Сіз ${score} ${demoQuestions.length} сұрақтың дұрыс жауап бердіңіз`
                                    : `Вы ответили правильно на ${score} из ${demoQuestions.length} вопросов`}
                                </div>
                                <Button 
                                  type="primary" 
                                  size="large"
                                  onClick={resetQuiz}
                                  className="bg-teal-600 hover:bg-teal-700"
                                >
                                  {isKz ? "Қайта бастау" : "Начать заново"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>
    
    </Layout>
  );
}
