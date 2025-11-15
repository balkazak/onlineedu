"use client";

import { useEffect, useState } from "react";
import { Card, Button, message, Empty, Layout, Collapse } from "antd";
import { PlayCircleOutlined, ArrowLeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getCourse } from "@/lib/api";
import { Course, CourseSection } from "@/lib/types";
import Header from "@/components/Header";
import Loader from "@/components/Loader";

const { Content, Sider } = Layout;
const { Panel } = Collapse;

export default function CoursePage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<CourseSection | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { userData, loading: userLoading } = useUser();

  useEffect(() => {
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
        router.push("/");
      }, 2000);
      return;
    }

    if (userData?.role === "student" && !userData.allowedCourses.includes(courseId)) {
      message.error("Вам курс не доступен, обратитесь в службу поддержки", 5);
      setLoading(false);
      setTimeout(() => {
        router.push("/");
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
          width={300}
          className="bg-white shadow-lg"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          breakpoint="lg"
          collapsedWidth={0}
        >
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{course.title}</h3>
            <Collapse
              defaultActiveKey={course.sections.length > 0 ? [course.sections[0].id] : []}
              ghost
            >
              {course.sections.map((section) => (
                <Panel
                  header={
                    <div
                      className={`flex items-center justify-between ${
                        selectedSection?.id === section.id ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      <span>{section.title}</span>
                      <PlayCircleOutlined />
                    </div>
                  }
                  key={section.id}
                >
                  <Button
                    type={selectedSection?.id === section.id ? "primary" : "default"}
                    block
                    onClick={() => setSelectedSection(section)}
                    className="mb-2"
                  >
                    Открыть урок
                  </Button>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                  )}
                </Panel>
              ))}
            </Collapse>
          </div>
        </Sider>
        <Content className="p-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/")}
            className="mb-6"
          >
            Назад к курсам
          </Button>

          <Card className="mb-6 shadow-lg border-0 rounded-xl">
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
