"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Radio, Upload } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Course, Lesson, TestQuestion } from "@/lib/types";
import { getAllCourses, createCourse, updateCourse, deleteCourse, uploadImage } from "@/lib/api";
import type { UploadFile } from "antd";

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    const data = await getAllCourses();
    setCourses(data);
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingCourse(null);
    form.resetFields();
    form.setFieldsValue({ 
      lessons: [{ 
        id: Date.now().toString(), 
        title: "", 
        youtubeLink: "", 
        description: "", 
        solutionVideoLink: "",
        test: {
          questions: []
        }
      }] 
    });
    setModalVisible(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    const lessonsWithDefaults = course.lessons && course.lessons.length > 0 
      ? course.lessons.map(lesson => {
          const lessonData: any = {
            ...lesson,
            test: lesson.test || { questions: [] }
          };
          
          if (lessonData.test && lessonData.test.questions) {
            lessonData.test.questions = lessonData.test.questions.map((q: any) => {
              const questionData: any = { ...q };
              if (q.qImage) {
                questionData.qImageFile = [{
                  uid: '-1',
                  name: 'image.jpg',
                  status: 'done',
                  url: q.qImage
                }];
              }
              if (q.options) {
                questionData.options = q.options.map((opt: any, idx: number) => {
                  const optionData: any = { ...opt };
                  if (opt.image) {
                    optionData.imageFile = [{
                      uid: `-${idx}`,
                      name: 'image.jpg',
                      status: 'done',
                      url: opt.image
                    }];
                  }
                  return optionData;
                });
              }
              return questionData;
            });
          }
          
          return lessonData;
        })
      : [{ 
          id: Date.now().toString(), 
          title: "", 
          youtubeLink: "", 
          description: "", 
          solutionVideoLink: "",
          test: { questions: [] }
        }];
    form.setFieldsValue({
      ...course,
      lessons: lessonsWithDefaults
    });
    setModalVisible(true);
  };

  const handleDelete = async (courseId: string) => {
    const success = await deleteCourse(courseId);
    if (success) {
      message.success("Курс удален");
      loadCourses();
    } else {
      message.error("Ошибка при удалении курса");
    }
  };

  const handleSubmit = async (values: any) => {
    const lessons = await Promise.all((values.lessons || []).filter((l: any) => 
      l.title && l.youtubeLink
    ).map(async (l: any, index: number) => {
      const lesson: any = {
        id: l.id || `${Date.now()}-${index}`,
        title: l.title,
        youtubeLink: l.youtubeLink,
        description: l.description,
        solutionVideoLink: l.solutionVideoLink
      };

      if (l.test && l.test.questions && l.test.questions.length > 0) {
        const processedQuestions = await Promise.all(l.test.questions.map(async (q: any) => {
          const question: any = {
            q: q.q,
            options: [],
            answer: q.answer || ""
          };

          if (q.qImageFile && Array.isArray(q.qImageFile) && q.qImageFile.length > 0) {
            const fileItem = q.qImageFile[0];
            if (fileItem.originFileObj) {
              const file = fileItem.originFileObj;
              if (file instanceof File) {
                const imagePath = `lessons/${lesson.id}/questions/${Date.now()}-q.jpg`;
                const imageUrl = await uploadImage(file, imagePath);
                if (imageUrl) question.qImage = imageUrl;
              }
            } else if (fileItem.url) {
              question.qImage = fileItem.url;
            }
          } else if (q.qImage) {
            question.qImage = q.qImage;
          }

          if (q.options && Array.isArray(q.options)) {
            question.options = await Promise.all(q.options.map(async (opt: any, optIndex: number) => {
              const option: any = {
                label: opt.label || ['a', 'b', 'c', 'd'][optIndex] || '',
                text: opt.text || ''
              };

              if (opt.imageFile && Array.isArray(opt.imageFile) && opt.imageFile.length > 0) {
                const fileItem = opt.imageFile[0];
                if (fileItem.originFileObj) {
                  const file = fileItem.originFileObj;
                  if (file instanceof File) {
                    const imagePath = `lessons/${lesson.id}/options/${Date.now()}-${optIndex}.jpg`;
                    const imageUrl = await uploadImage(file, imagePath);
                    if (imageUrl) option.image = imageUrl;
                  }
                } else if (fileItem.url) {
                  option.image = fileItem.url;
                }
              } else if (opt.image) {
                option.image = opt.image;
              }

              return option;
            }));
          }

          return question;
        }));

        lesson.test = { questions: processedQuestions };
      }

      return lesson;
    }));

    if (lessons.length === 0) {
      message.error("Добавьте хотя бы один урок с названием и ссылкой на YouTube");
      return;
    }

    const courseData = {
      title: values.title,
      description: values.description,
      lessons
    };

    if (editingCourse) {
      const success = await updateCourse(editingCourse.id, courseData);
      if (success) {
        message.success("Курс обновлен");
        setModalVisible(false);
        loadCourses();
      } else {
        message.error("Ошибка при обновлении курса");
      }
    } else {
      const courseId = await createCourse(courseData);
      if (courseId) {
        message.success("Курс создан");
        setModalVisible(false);
        loadCourses();
      } else {
        message.error("Ошибка при создании курса");
      }
    }
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Уроков",
      key: "lessonsCount",
      render: (_: any, record: Course) => record.lessons?.length || 0,
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || <Tag color="default">Нет описания</Tag>,
    },
    {
      title: "Действия",
      key: "actions",
      width: 150,
      render: (_: any, record: Course) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Удалить курс?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Управление курсами</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Добавить курс
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCourse ? "Редактировать курс" : "Добавить курс"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="Название курса"
            rules={[{ required: true, message: "Введите название" }]}
          >
            <Input placeholder="Например: Математика" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание курса"
          >
            <Input.TextArea rows={3} placeholder="Описание курса" />
          </Form.Item>

          <Form.List name="lessons">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Урок {name + 1}</span>
                      <Button
                        type="link"
                        danger
                        onClick={() => remove(name)}
                        size="small"
                      >
                        Удалить
                      </Button>
                    </div>
                    <Form.Item
                      {...restField}
                      name={[name, "title"]}
                      label="Название урока"
                      rules={[{ required: true, message: "Введите название урока" }]}
                    >
                      <Input placeholder="Например: Логарифмы" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "youtubeLink"]}
                      label="YouTube ссылка (видео урока)"
                      rules={[
                        { required: true, message: "Введите ссылку на YouTube" },
                        { type: "url", message: "Введите корректную ссылку" },
                      ]}
                    >
                      <Input placeholder="https://youtu.be/X17EgOFRLqI" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      label="Описание урока"
                    >
                      <Input.TextArea rows={2} placeholder="Описание урока" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "solutionVideoLink"]}
                      label="YouTube ссылка (видео с решением)"
                      rules={[
                        { type: "url", message: "Введите корректную ссылку" },
                      ]}
                    >
                      <Input placeholder="https://youtu.be/X17EgOFRLqI" />
                    </Form.Item>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="font-semibold mb-3">Тест к уроку</div>
                      <Form.Item
                        {...restField}
                        name={[name, "test", "questions"]}
                        initialValue={[]}
                      >
                        <Form.List name={[name, "test", "questions"]}>
                          {(questionFields, { add: addQuestion, remove: removeQuestion }) => (
                            <>
                              {questionFields.map(({ key: qKey, name: qName, ...qRestField }) => (
                                <div key={qKey} className="mb-4 p-3 border rounded bg-white">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Вопрос {qName + 1}</span>
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => removeQuestion(qName)}
                                      size="small"
                                    >
                                      Удалить
                                    </Button>
                                  </div>
                                  <Form.Item
                                    {...qRestField}
                                    name={[qName, "q"]}
                                    label="Текст вопроса"
                                    rules={[{ required: true, message: "Введите вопрос" }]}
                                  >
                                    <Input.TextArea rows={2} placeholder="Введите вопрос" />
                                  </Form.Item>
                                  <Form.Item
                                    {...qRestField}
                                    name={[qName, "qImageFile"]}
                                    label="Картинка к вопросу"
                                    getValueFromEvent={(e) => {
                                      if (Array.isArray(e)) return e;
                                      return e?.fileList;
                                    }}
                                    valuePropName="fileList"
                                  >
                                    <Upload
                                      beforeUpload={(file) => {
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                          message.error('Можно загружать только изображения!');
                                          return Upload.LIST_IGNORE;
                                        }
                                        return false;
                                      }}
                                      listType="picture"
                                      maxCount={1}
                                      defaultFileList={(() => {
                                        const qImage = form.getFieldValue(['lessons', name, 'test', 'questions', qName, 'qImage']);
                                        if (qImage) {
                                          return [{
                                            uid: '-1',
                                            name: 'image.jpg',
                                            status: 'done',
                                            url: qImage
                                          }];
                                        }
                                        return [];
                                      })()}
                                    >
                                      <Button icon={<UploadOutlined />}>Загрузить картинку</Button>
                                    </Upload>
                                  </Form.Item>
                                  <Form.Item
                                    {...qRestField}
                                    name={[qName, "qImage"]}
                                    hidden
                                  >
                                    <Input type="hidden" />
                                  </Form.Item>
                                  <Form.Item
                                    {...qRestField}
                                    name={[qName, "options"]}
                                    initialValue={[
                                      { label: "a", text: "" },
                                      { label: "b", text: "" },
                                      { label: "c", text: "" },
                                      { label: "d", text: "" }
                                    ]}
                                  >
                                    <Form.List name={[qName, "options"]}>
                                      {(optionFields) => (
                                        <>
                                          {optionFields.map(({ key: optKey, name: optName, ...optRestField }) => (
                                            <div key={optKey} className="mb-2">
                                              <div className="flex items-start gap-2">
                                                <div className="flex-shrink-0 w-8 pt-1">
                                                  <span className="font-semibold text-gray-700">
                                                    {['a', 'b', 'c', 'd'][optName]?.toUpperCase()}
                                                  </span>
                                                </div>
                                                <div className="flex-1">
                                                  <Form.Item
                                                    {...optRestField}
                                                    name={[optName, "text"]}
                                                    rules={[{ required: true, message: "Введите вариант ответа" }]}
                                                    className="mb-2"
                                                  >
                                                    <Input placeholder={`Вариант ${['a', 'b', 'c', 'd'][optName]}`} />
                                                  </Form.Item>
                                                  <Form.Item
                                                    {...optRestField}
                                                    name={[optName, "imageFile"]}
                                                    getValueFromEvent={(e) => {
                                                      if (Array.isArray(e)) return e;
                                                      return e?.fileList;
                                                    }}
                                                    valuePropName="fileList"
                                                    className="mb-0"
                                                  >
                                                    <Upload
                                                      beforeUpload={(file) => {
                                                        const isImage = file.type.startsWith('image/');
                                                        if (!isImage) {
                                                          message.error('Можно загружать только изображения!');
                                                          return Upload.LIST_IGNORE;
                                                        }
                                                        return false;
                                                      }}
                                                      listType="picture"
                                                      maxCount={1}
                                                      defaultFileList={(() => {
                                                        const optImage = form.getFieldValue(['lessons', name, 'test', 'questions', qName, 'options', optName, 'image']);
                                                        if (optImage) {
                                                          return [{
                                                            uid: `-${optName}`,
                                                            name: 'image.jpg',
                                                            status: 'done',
                                                            url: optImage
                                                          }];
                                                        }
                                                        return [];
                                                      })()}
                                                    >
                                                      <Button size="small" icon={<UploadOutlined />}>Картинка</Button>
                                                    </Upload>
                                                  </Form.Item>
                                                  <Form.Item
                                                    {...optRestField}
                                                    name={[optName, "image"]}
                                                    hidden
                                                  >
                                                    <Input type="hidden" />
                                                  </Form.Item>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </>
                                      )}
                                    </Form.List>
                                  </Form.Item>
                                  <Form.Item
                                    {...qRestField}
                                    name={[qName, "answer"]}
                                    label="Правильный ответ"
                                    rules={[{ required: true, message: "Выберите правильный ответ" }]}
                                  >
                                    <Radio.Group>
                                      <Radio value="a">A</Radio>
                                      <Radio value="b">B</Radio>
                                      <Radio value="c">C</Radio>
                                      <Radio value="d">D</Radio>
                                    </Radio.Group>
                                  </Form.Item>
                                </div>
                              ))}
                              <Form.Item>
                                <Button type="dashed" onClick={() => addQuestion()} block>
                                  Добавить вопрос
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Form.Item>
                    </div>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Добавить урок
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCourse ? "Сохранить" : "Создать"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
