"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { User } from "@/lib/types";
import { getAllUsers, getAllCourses, createUser, updateUser, deleteUser } from "@/lib/api";
import { useUser } from "@/contexts/UserContext";

const { Option } = Select;

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { refreshUserData } = useUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const usersData = await getAllUsers();
    setUsers(usersData);
    const coursesData = await getAllCourses();
    setCourses(coursesData);
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: "student", allowedCourses: [] });
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (email: string) => {
    const success = await deleteUser(email);
    if (success) {
      message.success("Пользователь удален");
      loadData();
    } else {
      message.error("Ошибка при удалении пользователя");
    }
  };

  const handleSubmit = async (values: any) => {
    if (editingUser) {
      const success = await updateUser(editingUser.email, values);
      if (success) {
        message.success("Пользователь обновлен");
        setModalVisible(false);
        await loadData();
        await refreshUserData();
      } else {
        message.error("Ошибка при обновлении пользователя");
      }
    } else {
      if (!values.password || values.password.length < 6) {
        message.error("Пароль должен быть не менее 6 символов");
        return;
      }
      const success = await createUser(
        values.email,
        values.password,
        values.role,
        values.allowedCourses || []
      );
      
      if (success) {
        message.success("Пользователь создан");
        setModalVisible(false);
        loadData();
        await refreshUserData();
      } else {
        message.error("Ошибка при создании пользователя");
      }
    }
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Роль",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <span className={role === "admin" ? "text-red-600 font-semibold" : ""}>
          {role === "admin" ? "Администратор" : "Студент"}
        </span>
      ),
    },
    {
      title: "Доступные курсы",
      dataIndex: "allowedCourses",
      key: "allowedCourses",
      render: (courses: string[]) => (
        <span>{courses.length} курс(ов)</span>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Удалить пользователя?"
            onConfirm={() => handleDelete(record.email)}
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
        <h2 className="text-xl font-semibold">Управление пользователями</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Добавить пользователя
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="email"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingUser ? "Редактировать пользователя" : "Добавить пользователя"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input disabled={!!editingUser} placeholder="user@example.com" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Пароль"
              rules={[
                { required: true, message: "Введите пароль" },
                { min: 6, message: "Минимум 6 символов" },
              ]}
            >
              <Input.Password placeholder="Пароль" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: "Выберите роль" }]}
          >
            <Select>
              <Option value="student">Студент</Option>
              <Option value="admin">Администратор</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="allowedCourses"
            label="Доступные курсы"
          >
            <Select
              mode="multiple"
              placeholder="Выберите курсы"
              showSearch
              optionFilterProp="children"
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? "Сохранить" : "Создать"}
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

