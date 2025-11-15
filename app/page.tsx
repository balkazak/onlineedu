"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Button, Spin, Empty, Tag } from "antd";
import { PlayCircleOutlined, BookOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getAllCourses } from "@/lib/api";
import { Course } from "@/lib/types";
import Header from "@/components/Header";
import { Layout } from "antd";

const { Content, Footer } = Layout;

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { userData } = useUser();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const allCourses = await getAllCourses();
    if (userData?.role === "student") {
      const allowedCourses = allCourses.filter(course => 
        userData.allowedCourses.includes(course.id)
      );
      setCourses(allowedCourses);
    } else {
      setCourses(allCourses);
    }
    setLoading(false);
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getYouTubeThumbnail = (course: Course) => {
    if (course.sections && course.sections.length > 0) {
      const firstSection = course.sections[0];
      const videoId = getYouTubeVideoId(firstSection.youtubeLink);
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Онлайн платформа для обучения
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto">
              Курсы, тесты и рейтинги. Начните обучение сегодня.
            </p>
            {!userData && (
              <Button 
                type="primary" 
                size="large" 
                className="bg-white text-blue-600 border-0 h-14 px-10 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                onClick={() => router.push("/login")}
              >
                Начать обучение
              </Button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                Доступные курсы
              </h2>
              <p className="text-gray-600 mt-2">Выберите курс и начните обучение</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Spin size="large" />
            </div>
          ) : courses.length === 0 ? (
            <Empty 
              description="Курсы пока не добавлены" 
              className="py-20"
            />
          ) : (
            <Row gutter={[24, 24]}>
              {courses.map((course) => {
                const thumbnail = getYouTubeThumbnail(course);
                return (
                  <Col xs={24} sm={12} lg={8} key={course.id}>
                    <Card
                      hoverable
                      className="h-full shadow-md hover:shadow-xl rounded-xl overflow-hidden border-0 transition-all duration-300 transform hover:-translate-y-1"
                      cover={
                        thumbnail ? (
                          <div className="relative h-52 overflow-hidden group">
                            <img
                              alt={course.title}
                              src={thumbnail}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                                <PlayCircleOutlined className="text-blue-600 text-2xl ml-1" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-52 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                            <PlayCircleOutlined className="text-white text-5xl" />
                          </div>
                        )
                      }
                      actions={[
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={() => router.push(`/course/${course.id}`)}
                          block
                          className="h-11 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Открыть курс
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</span>
                            {userData?.role === "admin" && (
                              <Tag color="blue" className="ml-2 flex-shrink-0">Админ</Tag>
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-1">
                              {course.description || "Изучите новый материал и пройдите тесты"}
                            </p>
                            {course.sections && course.sections.length > 0 && (
                              <Tag color="blue" className="text-xs">
                                {course.sections.length} секций
                              </Tag>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Content>
      <Footer className="text-center bg-gray-900 text-gray-300 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-2">© 2025 Онлайн Образование. Все права защищены.</p>
          <p className="text-sm text-gray-500">Платформа для онлайн обучения</p>
        </div>
      </Footer>
    </Layout>
  );
}
