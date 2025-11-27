"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, Row, Col, Button, Empty, Tag, message } from "antd";
import { PlayCircleOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getAllCourses } from "@/lib/api";
import { Course } from "@/lib/types";
import Header from "@/components/Header";
import { Layout } from "antd";
import { CardSkeletonGrid } from "@/components/CardSkeleton";

const { Content } = Layout;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const { userData } = useUser();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    // Try to load from localStorage first
    const cached = localStorage.getItem("courses_cache");
    if (cached) {
      try {
        setCourses(JSON.parse(cached));
        setInitialLoad(false);
      } catch (e) {
        console.error("Cache parse error:", e);
      }
    }

    // Load fresh data in background
    setLoading(true);
    const allCourses = await getAllCourses();
    setCourses(allCourses);
    localStorage.setItem("courses_cache", JSON.stringify(allCourses));
    setLoading(false);
    setInitialLoad(false);
  };

  const isCourseAccessible = useCallback((courseId: string) => {
    if (!userData) return false;
    if (userData.role === "admin") return true;
    if (userData.role === "student") {
      return userData.allowedCourses.includes(courseId);
    }
    return false;
  }, [userData]);

  const getYouTubeVideoId = useCallback((url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, []);

  const getYouTubeThumbnail = useCallback((course: Course) => {
    if (course.lessons && course.lessons.length > 0) {
      const firstLesson = course.lessons[0];
      const videoId = getYouTubeVideoId(firstLesson.youtubeLink);
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  }, [getYouTubeVideoId]);

  if (initialLoad && courses.length === 0) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Header />
        <Content>
          <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-16 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="relative max-w-7xl mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Курсы
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-teal-100 max-w-2xl mx-auto">
                Выберите курс и начните обучение
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-16">
            <CardSkeletonGrid count={6} />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Header />
      <Content>
        <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Курсы
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-teal-100 max-w-2xl mx-auto">
              Выберите курс и начните обучение
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {initialLoad && courses.length === 0 ? (
            <CardSkeletonGrid count={6} />
          ) : courses.length === 0 ? (
            <Empty 
              description="Курсы пока не добавлены" 
              className="py-20"
            />
          ) : (
            <Row gutter={[24, 24]}>
              {courses.map((course) => {
                const thumbnail = getYouTubeThumbnail(course);
                const accessible = isCourseAccessible(course.id);
                return (
                  <Col xs={24} sm={12} lg={8} key={course.id}>
                    <Card
                      hoverable
                      className="h-full shadow-md hover:shadow-xl rounded-xl overflow-hidden border-0 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                      cover={
                        thumbnail ? (
                          <div className="relative h-52 overflow-hidden group">
                            <img
                              alt={course.title}
                              src={thumbnail}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                                <PlayCircleOutlined className="text-teal-600 text-xl" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-52 bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 flex items-center justify-center w-full">
                            <div className="flex items-center justify-center w-full h-full">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                <PlayCircleOutlined className="text-teal-600 text-xl" />
                              </div>
                            </div>
                          </div>
                        )
                      }
                      styles={{ body: { padding: "18px 16px 8px 16px", minHeight: 120 } }}
                      actions={[
                        <Button
                          key="action"
                          type="primary"
                          icon={accessible ? <PlayCircleOutlined /> : <LockOutlined />}
                          onClick={() => {
                            if (!userData) {
                              message.error("Вы должны войти, чтобы увидеть курс");
                              router.push("/login");
                              return;
                            }
                            if (accessible) {
                              router.push(`/course/${course.id}`);
                            } else {
                              message.error("Простите, у вас нет доступа на этот курс");
                            }
                          }}
                          style={{ padding: "0 18px", height: 36, fontSize: 15, borderRadius: 8, minWidth: 128 }}
                          className={`font-semibold border-0 m-0 ${
                            accessible
                              ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                              : "bg-gray-400 hover:bg-gray-500"
                          }`}
                        >
                          {accessible ? "Открыть курс" : "Недоступен"}
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">{course.title}</span>
                            <div className="flex gap-2 flex-shrink-0">
                              {!accessible && userData && (
                                <Tag color="red" className="ml-2">Недоступен</Tag>
                              )}
                              {userData?.role === "admin" && (
                                <Tag color="blue">Админ</Tag>
                              )}
                            </div>
                          </div>
                        }
                        description={
                          <div className="pt-1">
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2 min-h-[36px]">
                              {course.description || "Изучите новый материал и пройдите тесты"}
                            </p>
                            {course.lessons && course.lessons.length > 0 && (
                              <Tag color="blue" className="text-xs">
                                {course.lessons.length} уроков
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
    </Layout>
  );
}

