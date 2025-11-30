"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Card, Button, message, Empty, Layout, Radio, Space } from "antd";
import { ArrowLeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getCourse } from "@/lib/api";
import { Course, Lesson } from "@/lib/types";
import Header from "@/components/Header";
import Loader from "@/components/Loader";

const { Content, Sider } = Layout;

export default function CoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testResults, setTestResults] = useState<Record<number, boolean> | null>(null);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const { userData, loading: userLoading } = useUser();

  useEffect(() => {
    // Disable body scroll on course page
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (params.id) {
      loadCourse();
    }
  }, [params.id]);

  useEffect(() => {
    if (!userLoading && !userData && params.id) {
      const timer = setTimeout(() => {
        message.error("Вы должны войти, чтобы увидеть курс");
        router.push("/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [userLoading, userData, params.id, router]);

  const loadCourse = async () => {
    setLoading(true);
    const courseId = params.id as string;
    const courseData = await getCourse(courseId);
    
    if (!courseData) {
      message.error("Курс не найден");
      setLoading(false);
      setTimeout(() => {
        router.push("/courses");
      }, 2000);
      return;
    }

    if (userData?.role === "student" && !userData.allowedCourses.includes(courseId)) {
      message.error("Простите, у вас нет доступа на этот курс", 5);
      setLoading(false);
      setTimeout(() => {
        router.push("/courses");
      }, 3000);
      return;
    }

    setCourse(courseData);
    if (courseData.lessons && courseData.lessons.length > 0) {
      setSelectedLesson(courseData.lessons[0]);
    }
    setShowTest(false);
    setShowSolution(false);
    setTestAnswers({});
    setTestResults(null);
    setTestSubmitted(false);
    setLoading(false);
  };

  const getYouTubeEmbedUrl = useCallback((url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }, []);

  const embedUrl = useMemo(() => 
    selectedLesson ? getYouTubeEmbedUrl(selectedLesson.youtubeLink) : null,
    [selectedLesson, getYouTubeEmbedUrl]
  );
  
  const allEmbedUrls = useMemo(() => {
    if (!selectedLesson) return [];
    const links = selectedLesson.youtubeLinks || (selectedLesson.youtubeLink ? [selectedLesson.youtubeLink] : []);
    return links.map(link => getYouTubeEmbedUrl(link)).filter(Boolean);
  }, [selectedLesson, getYouTubeEmbedUrl]);
  
  const solutionEmbedUrl = useMemo(() => 
    selectedLesson?.solutionVideoLink ? getYouTubeEmbedUrl(selectedLesson.solutionVideoLink) : null,
    [selectedLesson, getYouTubeEmbedUrl]
  );

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Loader />
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Content className="flex items-center justify-center py-20">
          <Empty description="Курс не найден" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Layout>
        <Sider
          width={380}
          className="bg-white shadow-xl border-r border-gray-200 overflow-y-auto overflow-x-hidden"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          breakpoint="lg"
          collapsedWidth={0}
          style={{ maxHeight: "calc(100vh - 64px)", overflowY: "auto", overflowX: "hidden" }}
        >
          <div className="p-4 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">{course.title}</h3>
            <div className="space-y-2">
              {course.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`rounded-lg border transition-all duration-200 ${
                      selectedLesson?.id === lesson.id
                        ? "bg-teal-50 border-teal-300 shadow-md"
                        : "bg-white border-gray-200 hover:border-teal-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className={`text-sm font-semibold flex-1 leading-tight ${
                          selectedLesson?.id === lesson.id ? "text-teal-700" : "text-gray-900"
                        }`}>
                          {lesson.title}
                        </h4>
                        <Button
                          type={selectedLesson?.id === lesson.id ? "primary" : "default"}
                          size="small"
                          className={`text-xs font-medium rounded-md ${
                            selectedLesson?.id === lesson.id
                              ? "bg-teal-600 border-teal-600 hover:bg-teal-700"
                              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                          }`}
                          style={{ minWidth: 100, height: 28, padding: "0 12px" }}
                          onClick={() => {
                          setSelectedLesson(lesson);
                          setShowTest(false);
                          setShowSolution(false);
                          setTestAnswers({});
                          setTestResults(null);
                          setTestSubmitted(false);
                          // Scroll right content to top
                          if (contentRef.current) {
                            contentRef.current.scrollTop = 0;
                          }
                        }}
                        >
                          Открыть урок
                        </Button>
                      </div>
                      {lesson.description && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Sider>
        <Content className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 64px)" }} ref={contentRef}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/courses")}
            className="mb-6 border-none shadow-md bg-teal-600 text-white hover:bg-teal-700 hover:text-white px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2"
          >
            Назад к курсам
          </Button>

          <Card className="mt-6 shadow-xl border-0 rounded-2xl">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
              )}
              {selectedLesson && (
                <div className="mt-4">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {selectedLesson.title}
                  </h2>
                  {selectedLesson.description && (
                    <p className="text-gray-600">{selectedLesson.description}</p>
                  )}
                </div>
              )}
            </div>
            
            {allEmbedUrls && allEmbedUrls.length > 0 ? (
              <div className="mb-6 space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Видео уроков ({allEmbedUrls.length})</h3>
                {allEmbedUrls.map((url, index) => (
                  <div key={index}>
                    {allEmbedUrls.length > 1 && (
                      <h4 className="text-base font-medium text-gray-700 mb-2">Видео {index + 1}</h4>
                    )}
                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={url}
                        title={`${selectedLesson?.title || course.title} - Видео ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedLesson ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Видео урока</h3>
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-96 flex items-center justify-center rounded-xl">
                  <p className="text-gray-500 text-lg">Неверная ссылка на видео</p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 h-96 flex items-center justify-center rounded-xl">
                <p className="text-gray-500 text-lg">Выберите урок из меню слева</p>
              </div>
            )}

            {selectedLesson && (
              <>
                {selectedLesson.test && selectedLesson.test.questions && selectedLesson.test.questions.length > 0 && (
                  <div className="mb-6">
                    {!showTest ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Тест к уроку</h3>
                        <p className="text-gray-600 mb-4">
                          Пройдите тест для закрепления материала. В тесте {selectedLesson.test.questions.length} {selectedLesson.test.questions.length === 1 ? 'вопрос' : selectedLesson.test.questions.length < 5 ? 'вопроса' : 'вопросов'}.
                        </p>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => {
                            setShowTest(true);
                            setTestAnswers({});
                            setTestResults(null);
                            setTestSubmitted(false);
                          }}
                          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 border-0"
                        >
                          Открыть тест
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold text-gray-800">Тест</h3>
                          <Button
                            onClick={() => {
                              setShowTest(false);
                              setTestAnswers({});
                              setTestResults(null);
                              setTestSubmitted(false);
                            }}
                            type="default"
                          >
                            Скрыть тест
                          </Button>
                        </div>
                        <div className="space-y-6">
                          {selectedLesson.test.questions.map((question, qIndex) => {
                            const isCorrect = testResults ? testResults[qIndex] : null;
                            const userAnswer = testAnswers[qIndex];
                            const correctAnswer = question.answer;
                            
                            return (
                              <Card 
                                key={qIndex} 
                                className={`shadow-md ${
                                  testSubmitted 
                                    ? isCorrect 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-red-500 bg-red-50'
                                    : ''
                                }`}
                              >
                                <div className="mb-4">
                                  <div className="flex items-start gap-3 mb-3">
                                    <span className="font-bold text-lg text-teal-600">{qIndex + 1}.</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <p className="text-base font-medium text-gray-800">{question.q}</p>
                                        {testSubmitted && (
                                          <span className={`text-sm font-semibold px-2 py-1 rounded ${
                                            isCorrect 
                                              ? 'bg-green-500 text-white' 
                                              : 'bg-red-500 text-white'
                                          }`}>
                                            {isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                                          </span>
                                        )}
                                      </div>
                                      {question.qImage && (
                                        <div className="mb-3">
                                          <img 
                                            src={question.qImage} 
                                            alt="Question" 
                                            loading="lazy"
                                            className="max-w-full h-auto rounded-lg border border-gray-200"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Radio.Group 
                                    className="w-full"
                                    value={userAnswer}
                                    onChange={(e) => {
                                      if (!testSubmitted) {
                                        setTestAnswers({ ...testAnswers, [qIndex]: e.target.value });
                                      }
                                    }}
                                    disabled={testSubmitted}
                                  >
                                    <Space direction="vertical" className="w-full" size="middle">
                                      {question.options.map((option, optIndex) => {
                                        const isSelected = userAnswer === option.label;
                                        const isCorrectOption = option.label === correctAnswer;
                                        let optionClass = '';
                                        
                                        if (testSubmitted) {
                                          if (isCorrectOption) {
                                            optionClass = 'bg-green-100 border-green-500';
                                          } else if (isSelected && !isCorrectOption) {
                                            optionClass = 'bg-red-100 border-red-500';
                                          }
                                        }
                                        
                                        return (
                                          <Radio 
                                            key={optIndex} 
                                            value={option.label} 
                                            className={`w-full ${optionClass}`}
                                          >
                                            <div className="flex items-start gap-3">
                                              <span className="font-semibold text-gray-700 min-w-[24px]">
                                                {option.label.toUpperCase()}.
                                              </span>
                                              <div className="flex-1">
                                                <span className="text-gray-700">{option.text}</span>
                                                {option.image && (
                                                  <div className="mt-2">
                                                    <img 
                                                      src={option.image} 
                                                      alt={`Option ${option.label}`} 
                                                      loading="lazy"
                                                      className="max-w-md h-auto rounded border border-gray-200"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </Radio>
                                        );
                                      })}
                                    </Space>
                                  </Radio.Group>
                                  {testSubmitted && !isCorrect && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                      <p className="text-sm text-gray-700">
                                        <span className="font-semibold">Правильный ответ:</span> {correctAnswer.toUpperCase()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                        {!testSubmitted ? (
                          <div className="mt-6 text-center">
                            <Button
                              type="primary"
                              size="large"
                              onClick={() => {
                                const results: Record<number, boolean> = {};
                                (selectedLesson?.test?.questions || []).forEach((question, index) => {
                                  results[index] = testAnswers[index] === question.answer;
                                });
                                setTestResults(results);
                                setTestSubmitted(true);
                                
                                const correctCount = Object.values(results).filter(r => r).length;
                                const totalCount = selectedLesson.test.questions.length;
                                const percentage = Math.round((correctCount / totalCount) * 100);
                                
                                if (percentage === 100) {
                                  message.success(`Отлично! Вы ответили правильно на все вопросы! (${correctCount}/${totalCount})`);
                                } else if (percentage >= 70) {
                                  message.success(`Хорошо! Вы ответили правильно на ${correctCount} из ${totalCount} вопросов (${percentage}%)`);
                                } else {
                                  message.warning(`Вы ответили правильно на ${correctCount} из ${totalCount} вопросов (${percentage}%). Попробуйте еще раз!`);
                                }
                              }}
                              disabled={Object.keys(testAnswers).length !== selectedLesson.test.questions.length}
                              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 border-0"
                            >
                              Отправить ответы
                            </Button>
                            {Object.keys(testAnswers).length !== selectedLesson.test.questions.length && (
                              <p className="mt-2 text-sm text-gray-500">
                                Ответьте на все вопросы для отправки
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-6 p-6 bg-teal-50 border border-teal-200 rounded-xl text-center">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Результаты теста</h4>
                            <p className="text-2xl font-bold text-teal-600 mb-2">
                              {Object.values(testResults || {}).filter(r => r).length} / {selectedLesson.test.questions.length}
                            </p>
                            <p className="text-gray-600 mb-4">
                              Правильных ответов: {Math.round((Object.values(testResults || {}).filter(r => r).length / selectedLesson.test.questions.length) * 100)}%
                            </p>
                            <Button
                              onClick={() => {
                                setTestAnswers({});
                                setTestResults(null);
                                setTestSubmitted(false);
                              }}
                              type="default"
                            >
                              Пройти тест заново
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {solutionEmbedUrl && (
                  <div className="mb-6">
                    {!showSolution ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Видео с решением</h3>
                        <p className="text-gray-600 mb-4">
                          Посмотрите видео с разбором решений теста.
                        </p>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => setShowSolution(true)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
                        >
                          Открыть видео с решением
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xl font-semibold text-gray-800">Видео с решением</h3>
                          <Button
                            onClick={() => setShowSolution(false)}
                            type="default"
                          >
                            Скрыть видео
                          </Button>
                        </div>
                        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl">
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={solutionEmbedUrl}
                            title={`Решение: ${selectedLesson.title}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
