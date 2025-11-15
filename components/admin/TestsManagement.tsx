"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, InputNumber, Select, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Test, TestQuestion } from "@/lib/types";
import { getAllTests, createTest, updateTest, deleteTest, getAllUsers } from "@/lib/api";

const { Option } = Select;

export default function TestsManagement() {
  const [tests, setTests] = useState<Test[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    const data = await getAllTests();
    setTests(data);
    const usersData = await getAllUsers();
    setUsers(usersData);
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingTest(null);
    form.resetFields();
    form.setFieldsValue({ 
      questions: [{ 
        q: "", 
        options: ["", "", ""], 
        answer: "" 
      }],
      timeLimit: 30,
      allowedUsers: []
    });
    setModalVisible(true);
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    form.setFieldsValue(test);
    setModalVisible(true);
  };

  const handleDelete = async (testId: string) => {
    const success = await deleteTest(testId);
    if (success) {
      message.success("Тест удален");
      loadTests();
    } else {
      message.error("Ошибка при удалении теста");
    }
  };

  const handleSubmit = async (values: any) => {
    const questions = values.questions
      .map((q: any) => ({
        q: q.q,
        options: Array.isArray(q.options) ? q.options.filter((opt: string) => opt && opt.trim()) : [],
        answer: q.answer,
      }))
      .filter((q: TestQuestion) => 
        q.q && q.options.length >= 2 && q.answer
      );

    if (questions.length === 0) {
      message.error("Добавьте хотя бы один вопрос с минимум 2 вариантами ответа");
      return;
    }

    if (!values.timeLimit || values.timeLimit <= 0) {
      message.error("Установите время выполнения теста");
      return;
    }

    const testData = {
      title: values.title,
      description: values.description,
      questions,
      timeLimit: values.timeLimit,
      allowedUsers: values.allowedUsers || []
    };

    if (editingTest?.id) {
      const success = await updateTest(editingTest.id, testData);
      if (success) {
        message.success("Тест обновлен");
        setModalVisible(false);
        loadTests();
      } else {
        message.error("Ошибка при обновлении теста");
      }
    } else {
      const testId = await createTest(testData);
      if (testId) {
        message.success("Тест создан");
        setModalVisible(false);
        loadTests();
      } else {
        message.error("Ошибка при создании теста");
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
      title: "Вопросов",
      key: "questionsCount",
      render: (_: any, record: Test) => record.questions.length,
    },
    {
      title: "Время (мин)",
      dataIndex: "timeLimit",
      key: "timeLimit",
      render: (time: number) => `${time} мин`,
    },
    {
      title: "Доступ",
      key: "access",
      render: (_: any, record: Test) => 
        record.allowedUsers && record.allowedUsers.length > 0 
          ? <Tag color="orange">{record.allowedUsers.length} пользователей</Tag>
          : <Tag color="green">Все</Tag>,
    },
    {
      title: "Действия",
      key: "actions",
      width: 150,
      render: (_: any, record: Test) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Удалить тест?"
            onConfirm={() => record.id && handleDelete(record.id)}
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
        <h2 className="text-xl font-semibold">Управление тестами</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Добавить тест
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTest ? "Редактировать тест" : "Добавить тест"}
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
            label="Название теста"
            rules={[{ required: true, message: "Введите название теста" }]}
          >
            <Input placeholder="Название теста" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание теста"
          >
            <Input.TextArea rows={2} placeholder="Описание теста" />
          </Form.Item>

          <Form.Item
            name="timeLimit"
            label="Время выполнения (минуты)"
            rules={[
              { required: true, message: "Установите время выполнения" },
              { type: "number", min: 1, message: "Минимум 1 минута" }
            ]}
          >
            <InputNumber
              min={1}
              max={300}
              placeholder="30"
              className="w-full"
              addonAfter="минут"
            />
          </Form.Item>

          <Form.Item
            name="allowedUsers"
            label="Доступные пользователи (оставьте пустым для всех)"
            tooltip="Если не указаны пользователи, тест доступен всем"
          >
            <Select
              mode="multiple"
              placeholder="Выберите пользователей"
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {users.map((user) => (
                <Option key={user.email} value={user.email}>
                  {user.email} ({user.role === "admin" ? "Админ" : "Студент"})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-4 p-4 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Вопрос {name + 1}</span>
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
                      name={[name, "q"]}
                      label="Вопрос"
                      rules={[{ required: true, message: "Введите вопрос" }]}
                    >
                      <Input placeholder="Текст вопроса" />
                    </Form.Item>
                    <Form.List name={[name, "options"]}>
                      {(optionFields, { add: addOption, remove: removeOption }) => (
                        <>
                          {optionFields.map(({ key: optKey, name: optName, ...optRestField }) => (
                            <Form.Item
                              {...optRestField}
                              name={optName}
                              key={optKey}
                              label={optName === 0 ? "Варианты ответов" : ""}
                              rules={[{ required: true, message: "Введите вариант" }]}
                            >
                              <Input
                                placeholder={`Вариант ${optName + 1}`}
                                suffix={
                                  optionFields.length > 2 ? (
                                    <Button
                                      type="link"
                                      danger
                                      onClick={() => removeOption(optName)}
                                      size="small"
                                    >
                                      Удалить
                                    </Button>
                                  ) : null
                                }
                              />
                            </Form.Item>
                          ))}
                          {optionFields.length < 6 && (
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addOption()}
                                block
                                size="small"
                              >
                                Добавить вариант
                              </Button>
                            </Form.Item>
                          )}
                        </>
                      )}
                    </Form.List>
                    <Form.Item
                      {...restField}
                      name={[name, "answer"]}
                      label="Правильный ответ"
                      rules={[{ required: true, message: "Выберите правильный ответ" }]}
                    >
                      <Input placeholder="Точный текст правильного ответа" />
                    </Form.Item>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Добавить вопрос
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTest ? "Сохранить" : "Создать"}
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
