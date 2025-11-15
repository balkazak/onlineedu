"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Course, CourseSection } from "@/lib/types";
import { getAllCourses, createCourse, updateCourse, deleteCourse } from "@/lib/api";

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
    form.setFieldsValue({ sections: [{ id: Date.now().toString(), title: "", youtubeLink: "", description: "" }] });
    setModalVisible(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    form.setFieldsValue({
      ...course,
      sections: course.sections && course.sections.length > 0 ? course.sections : [{ id: Date.now().toString(), title: "", youtubeLink: "", description: "" }]
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
    const sections = (values.sections || []).filter((s: CourseSection) => 
      s.title && s.youtubeLink
    ).map((s: CourseSection, index: number) => ({
      ...s,
      id: s.id || `${Date.now()}-${index}`
    }));

    if (sections.length === 0) {
      message.error("Добавьте хотя бы одну секцию с названием и ссылкой на YouTube");
      return;
    }

    const courseData = {
      title: values.title,
      description: values.description,
      sections
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Название",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Секций",
      key: "sectionsCount",
      render: (_: any, record: Course) => record.sections?.length || 0,
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

          <Form.List name="sections">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Секция {name + 1}</span>
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
                      label="Название секции"
                      rules={[{ required: true, message: "Введите название секции" }]}
                    >
                      <Input placeholder="Например: Логарифмы" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "youtubeLink"]}
                      label="YouTube ссылка"
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
                      label="Описание секции"
                    >
                      <Input.TextArea rows={2} placeholder="Описание секции" />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Добавить секцию
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
