"use client";

import { useEffect, useState, useRef } from "react";
import { Card, Radio, Button, message, Result, Progress, Layout, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getTest } from "@/lib/api";
import { Test } from "@/lib/types";
import Header from "@/components/Header";
import Loader from "@/components/Loader";

const { Content } = Layout;

export default function TestPage() {
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const params = useParams();
  const { userData, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !userData) {
      message.error("Вы должны войти, чтобы пройти тест");
      router.push("/login");
      return;
    }
    if (params.id && !userLoading) {
      loadTest();
    }
  }, [params.id, userLoading, userData]);

  useEffect(() => {
    if (testStarted && timeLeft > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, timeLeft, submitted]);

  const loadTest = async () => {
    setLoading(true);
    const testId = params.id as string;
    const testData = await getTest(testId);
    
    if (!testData) {
      message.error("Тест не найден");
      setLoading(false);
      setTimeout(() => {
        router.push("/tests");
      }, 2000);
      return;
    }

    if (userData?.role === "student") {
      let hasAccess = false;
      if (userData.allowedTests && userData.allowedTests.length > 0) {
        hasAccess = userData.allowedTests.includes(testId);
      } else if (testData.allowedUsers && testData.allowedUsers.length > 0) {
        hasAccess = testData.allowedUsers.includes(userData.email);
      } else {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        message.error("Простите, у вас нет доступа на этот тест", 5);
        setLoading(false);
        setTimeout(() => {
          router.push("/tests");
        }, 3000);
        return;
      }
    }

    setTest(testData);
    setTimeLeft(testData.timeLimit * 60);
    setTestStarted(true);
    setLoading(false);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (submitted || timeLeft <= 0) return;
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  const handleAutoSubmit = () => {
    if (!test || submitted) return;
    setSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    calculateScore();
    message.warning("Время истекло! Тест завершен автоматически.");
  };

  const calculateScore = () => {
    if (!test) return;

    let correct = 0;
    test.questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correct++;
      }
    });

    const totalQuestions = test.questions.length;
    const percentage = Math.round((correct / totalQuestions) * 100);
    setScore(percentage);
  };

  const handleSubmit = () => {
    if (!test) return;
    if (submitted) return;

    setSubmitted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    calculateScore();
    message.success(`Тест завершен! Правильных ответов: ${test.questions.filter((q, i) => answers[i] === q.answer).length} из ${test.questions.length}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (userLoading || loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Loader />
      </Layout>
    );
  }

  if (!test) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Content className="flex items-center justify-center py-20">
          <Result status="404" title="Тест не найден" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/tests")}
          className="mb-6 border-none shadow-md bg-teal-600 text-white hover:bg-teal-700 hover:text-white px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2"
        >
          Назад к тестам
        </Button>

        <Card className="mb-8 shadow-xl border-0 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 text-gray-900">
                {test.title}
              </h1>
              {test.description && (
                <p className="text-gray-600 mb-4 text-lg">{test.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <Tag color="blue" className="text-sm font-semibold px-3 py-1">
                  {test.questions.length} вопросов
                </Tag>
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockCircleOutlined />
                  <span className="font-medium">{formatTime(test.timeLimit)} на прохождение</span>
                </div>
              </div>
            </div>
            {!submitted && testStarted && (
              <div className="flex-shrink-0">
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-300 shadow-md">
                  <div className="flex items-center gap-3">
                    <ClockCircleOutlined className="text-red-600 text-2xl" />
                    <div>
                      <div className="text-xs text-gray-600 font-medium">Осталось времени</div>
                      <div className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-600" : "text-gray-900"}`}>
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
          {submitted && (
            <div className="mb-4">
              <Progress 
                percent={score} 
                status={score >= 70 ? "success" : score >= 50 ? "normal" : "exception"}
                format={(percent) => `${percent}%`}
                strokeWidth={12}
                className="text-lg"
              />
            </div>
          )}
        </Card>

        {!submitted ? (
          <div className="space-y-8">
            {test.questions.map((question, index) => (
              <Card key={index} className="shadow-md border-0 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  {index + 1}. {question.q}
                </h3>
                {question.qImage && (
                  <div className="mb-4">
                    <img
                      src={question.qImage}
                      alt={`question-${index}-image`}
                      className="w-full max-h-64 object-contain rounded-md"
                      loading="lazy"
                    />
                  </div>
                )}
                <Radio.Group
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  value={answers[index]}
                  className="w-full flex flex-col gap-3"
                  disabled={timeLeft <= 0}
                >
                  {question.options.map((option: any, optIndex: number) => (
                    <div 
                      key={optIndex}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        answers[index] === option.label 
                          ? "border-teal-500 bg-teal-50" 
                          : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
                      }`}
                      onClick={() => handleAnswerChange(index, option.label)}
                    >
                      <Radio value={option.label} />
                      <span className="font-semibold text-base w-6 text-gray-700">
                        {option.label})
                      </span>
                      {option.image ? (
                        <img src={option.image} alt={`opt-${index}-${optIndex}`} className="w-24 h-24 object-contain rounded-md" loading="lazy" />
                      ) : (
                        <span className="text-base text-gray-800">{option.text}</span>
                      )}
                    </div>
                  ))}
                </Radio.Group>
              </Card>
            ))}
            <Card className="shadow-lg border-0 rounded-xl p-6 mb-8">
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== test.questions.length || timeLeft <= 0}
                block
                className="h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 border-none shadow-lg rounded-xl text-lg font-semibold"
              >
                Завершить тест
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {test.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.answer;
              
              return (
                <Card
                  key={index}
                  className={`shadow-md p-6 mb-6 ${
                    isCorrect ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {index + 1}. {question.q}
                    </h3>
                    {isCorrect ? (
                      <CheckCircleOutlined className="text-green-500 text-2xl" />
                    ) : (
                      <CloseCircleOutlined className="text-red-500 text-2xl" />
                    )}
                  </div>
                  <div className="space-y-4">
                    {question.options.map((option: any, optIndex: number) => {
                      let className = "p-2 rounded flex items-center gap-3";
                      if (option.label === question.answer) {
                        className += " bg-green-100 text-green-800 font-semibold";
                      } else if (option.label === userAnswer && !isCorrect) {
                        className += " bg-red-100 text-red-800";
                      }
                      return (
                        <div key={optIndex} className={className}>
                          {option.image && (
                            <img src={option.image} alt={`opt-result-${index}-${optIndex}`} className="w-20 h-20 object-contain rounded-md" loading="lazy" />
                          )}
                          <div className="flex-1">
                            {option.text || option.label}
                            {option.label === question.answer && " ✓ Правильный ответ"}
                            {option.label === userAnswer && !isCorrect && " ✗ Ваш ответ"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
            <Card className="p-6">
              <Result
                status={score >= 70 ? "success" : score >= 50 ? "warning" : "error"}
                title={`Результат: ${score}%`}
                subTitle={
                  score >= 70
                    ? "Отлично! Вы успешно прошли тест."
                    : score >= 50
                    ? "Хорошо, но можно лучше."
                    : "Попробуйте еще раз."
                }
                extra={[
                  <Button
                    key="back"
                    onClick={() => router.push("/tests")}
                  >
                    Вернуться к тестам
                  </Button>,
                ]}
              />
            </Card>
          </div>
        )}
      </Content>
    </Layout>
  );
}
