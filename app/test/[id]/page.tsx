"use client";

import { useEffect, useState, useRef } from "react";
import { Card, Radio, Button, message, Result, Progress, Layout } from "antd";
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
    if (params.id && !userLoading) {
      loadTest();
    }
  }, [params.id, userLoading]);

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
      if (testData.allowedUsers && testData.allowedUsers.length > 0 && !testData.allowedUsers.includes(userData.email)) {
        message.error("Вам тест не доступен, обратитесь в службу поддержки", 5);
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
      <Content className="max-w-5xl mx-auto px-4 py-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/tests")}
          className="mb-6"
        >
          Назад к тестам
        </Button>

        <Card className="mb-6 shadow-lg border-0 rounded-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {test.title}
              </h1>
              {test.description && (
                <p className="text-gray-600 mb-4">{test.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Вопросов: <strong>{test.questions.length}</strong></span>
              </div>
            </div>
            {!submitted && testStarted && (
              <div className="ml-4">
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-red-600 text-xl" />
                    <div>
                      <div className="text-xs text-gray-600">Осталось времени</div>
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
              />
            </div>
          )}
        </Card>

        {!submitted ? (
          <div className="space-y-6">
            {test.questions.map((question, index) => (
              <Card key={index} className="shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                  {index + 1}. {question.q}
                </h3>
                <Radio.Group
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  value={answers[index]}
                  className="w-full"
                  disabled={timeLeft <= 0}
                >
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <Radio key={optIndex} value={option} className="block py-2">
                        {option}
                      </Radio>
                    ))}
                  </div>
                </Radio.Group>
              </Card>
            ))}
            <Card>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== test.questions.length || timeLeft <= 0}
                block
                className="h-12"
              >
                Завершить тест
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {test.questions.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.answer;
              
              return (
                <Card
                  key={index}
                  className={`shadow-md ${
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
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      let className = "p-2 rounded";
                      if (option === question.answer) {
                        className += " bg-green-100 text-green-800 font-semibold";
                      } else if (option === userAnswer && !isCorrect) {
                        className += " bg-red-100 text-red-800";
                      }
                      return (
                        <div key={optIndex} className={className}>
                          {option}
                          {option === question.answer && " ✓ Правильный ответ"}
                          {option === userAnswer && !isCorrect && " ✗ Ваш ответ"}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
            <Card>
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
