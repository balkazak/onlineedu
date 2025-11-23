"use client";

import { useState } from "react";
import { Card, Radio, Button, message, Result, Progress, Layout, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

const { Content } = Layout;

const mockQuestions = [
  {
    q: "Что такое JavaScript?",
    options: [
      "Язык программирования для веб-разработки",
      "База данных",
      "Графический редактор",
      "Операционная система"
    ],
    answer: "Язык программирования для веб-разработки"
  },
  {
    q: "Какой тег используется для создания заголовка первого уровня в HTML?",
    options: [
      "<h1>",
      "<header>",
      "<title>",
      "<head>"
    ],
    answer: "<h1>"
  },
  {
    q: "Что означает CSS?",
    options: [
      "Cascading Style Sheets",
      "Computer Style Sheets",
      "Creative Style Sheets",
      "Colorful Style Sheets"
    ],
    answer: "Cascading Style Sheets"
  },
  {
    q: "Какой метод используется для добавления элемента в конец массива в JavaScript?",
    options: [
      "push()",
      "pop()",
      "shift()",
      "unshift()"
    ],
    answer: "push()"
  },
  {
    q: "Что такое React?",
    options: [
      "JavaScript библиотека для создания пользовательских интерфейсов",
      "База данных",
      "Язык программирования",
      "Фреймворк для бэкенда"
    ],
    answer: "JavaScript библиотека для создания пользовательских интерфейсов"
  }
];

export default function TrialTestPage() {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  const calculateScore = () => {
    let correct = 0;
    mockQuestions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correct++;
      }
    });

    const totalQuestions = mockQuestions.length;
    const percentage = Math.round((correct / totalQuestions) * 100);
    setScore(percentage);
  };

  const handleSubmit = () => {
    if (submitted) return;

    setSubmitted(true);
    calculateScore();
    message.success(`Тест завершен! Правильных ответов: ${mockQuestions.filter((q, i) => answers[i] === q.answer).length} из ${mockQuestions.length}`);
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content className="max-w-5xl mx-auto px-4 py-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/")}
          className="mb-6 border-none shadow-md bg-teal-600 text-white hover:bg-teal-700 hover:text-white px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2"
        >
          Назад на главную
        </Button>

        <Card className="mb-6 shadow-xl border-0 rounded-2xl">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 text-gray-900">
                Пробный тест
              </h1>
              <p className="text-gray-600 mb-4 text-lg">
                Проверьте свои знания с помощью пробного теста
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Tag color="blue" className="text-sm font-semibold px-3 py-1">
                  {mockQuestions.length} вопросов
                </Tag>
                <div className="flex items-center gap-2 text-gray-600">
                  <ClockCircleOutlined />
                  <span className="font-medium">Без ограничения по времени</span>
                </div>
              </div>
            </div>
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
          <div className="space-y-6">
            {mockQuestions.map((question, index) => (
              <Card key={index} className="shadow-md border-0 rounded-xl">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  {index + 1}. {question.q}
                </h3>
                <Radio.Group
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  value={answers[index]}
                  className="w-full"
                  optionType="button"
                  buttonStyle="solid"
                >
                  <div className="flex flex-col gap-4">
                    {question.options.map((option, optIndex) => (
                      <Radio.Button
                        key={optIndex}
                        value={option}
                        className="block w-full text-base border border-gray-300 rounded-lg py-3 hover:bg-teal-50 font-medium transition-all mb-2"
                      >
                        {option}
                      </Radio.Button>
                    ))}
                  </div>
                </Radio.Group>
              </Card>
            ))}
            <Card className="shadow-lg border-0 rounded-xl">
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== mockQuestions.length}
                block
                className="h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 border-none shadow-lg rounded-xl text-lg font-semibold"
              >
                Завершить тест
              </Button>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {mockQuestions.map((question, index) => {
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
                    onClick={() => router.push("/")}
                  >
                    Вернуться на главную
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

