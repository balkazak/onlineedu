"use client";

import { useEffect, useState } from "react";
import { Card, Button, message, Empty, Layout } from "antd";
import { ArrowLeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getCourse } from "@/lib/api";
import { Course, CourseSection } from "@/lib/types";
import Header from "@/components/Header";
import Loader from "@/components/Loader";

const { Content, Sider } = Layout;

export default function CoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { userData, loading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !userData) {
      message.error("Вы должны войти, чтобы увидеть курс");
      router.push("/login");
      return;
    }
    if (params.id && !userLoading) {
      loadCourse();
    }
  }, [params.id, userData, userLoading]);

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
    if (courseData.sections && courseData.sections.length > 0) {
      setSelectedSection(courseData.sections[0]);
    }
    setLoading(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (userLoading || loading) {
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

  const embedUrl = selectedSection ? getYouTubeEmbedUrl(selectedSection.youtubeLink) : null;

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Layout>
        <Sider
          width={320}
          className="bg-white shadow-xl border-r border-gray-200"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          breakpoint="lg"
          collapsedWidth={0}
        >
          <div className="p-4 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">{course.title}</h3>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {course.sections.map((section) => (
                  <div
                    key={section.id}
                    className={`rounded-lg border transition-all duration-200 ${
                      selectedSection?.id === section.id
                        ? "bg-blue-50 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className={`text-sm font-semibold flex-1 leading-tight ${
                          selectedSection?.id === section.id ? "text-blue-700" : "text-gray-900"
                        }`}>
                          {section.title}
                        </h4>
                        <Button
                          type={selectedSection?.id === section.id ? "primary" : "default"}
                          size="small"
                          className={`text-xs font-medium rounded-md ${
                            selectedSection?.id === section.id
                              ? "bg-blue-600 border-blue-600 hover:bg-blue-700"
                              : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                          }`}
                          style={{ minWidth: 100, height: 28, padding: "0 12px" }}
                          onClick={() => setSelectedSection(section)}
                        >
                          Открыть урок
                        </Button>
                      </div>
                      {section.description && (
                        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Sider>
        <Content className="p-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/courses")}
            className="mb-6 border-none shadow-md bg-blue-500 text-white hover:bg-blue-600 hover:text-white px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2"
          >
            Назад к курсам
          </Button>

          <Card className="mt-6 shadow-xl border-0 rounded-2xl">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
              )}
              {selectedSection && (
                <div className="mt-4">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {selectedSection.title}
                  </h2>
                  {selectedSection.description && (
                    <p className="text-gray-600">{selectedSection.description}</p>
                  )}
                </div>
              )}
            </div>
            
            {embedUrl ? (
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={embedUrl}
                  title={selectedSection?.title || course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : selectedSection ? (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-96 flex items-center justify-center rounded-xl">
                <p className="text-gray-500 text-lg">Неверная ссылка на видео</p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-96 flex items-center justify-center rounded-xl">
                <p className="text-gray-500 text-lg">Выберите раздел курса из меню слева</p>
              </div>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
