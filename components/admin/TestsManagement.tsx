"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, InputNumber, Select, Tag, Radio } from "antd";
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
        options: ["a", "b", "c", "d"],
        answer: "a"
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

  const optionLabel = (idx: number) => String.fromCharCode(97 + idx); // a, b, c, ...

  const columns = [
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
                      <Button type="link" danger onClick={() => remove(name)} size="small">Удалить</Button>
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
                      {(optionFields, { add: addOption, remove: removeOption }) => {
                        // auto-add 4 by default (for new)
                        if (optionFields.length < 4) {
                          for (let i = optionFields.length; i < 4; i++) addOption(undefined, i);
                        }
                        return (
                          <>
                            {optionFields.map((fld, idx) => (
                              <div key={fld.key} className="flex items-center gap-2">
                                <Form.Item
                                  {...fld}
                                  name={fld.name}
                                  label={<span className="font-semibold">{String.fromCharCode(97 + idx)})</span>}
                                  rules={[{ required: true, message: "Вариант обязателен" }]}
                                  className="flex-1"
                                >
                                  <Input placeholder={`Вариант ${String.fromCharCode(97 + idx)}`} />
                                </Form.Item>
                                {/* Удалять только если вариантов больше 4 и это не первые четыре */}
                                {optionFields.length > 4 && idx >= 4 && (
                                  <Button danger size="small" onClick={() => removeOption(fld.name)}>
                                    Удалить
                                  </Button>
                                )}
                              </div>
                            ))}
                            {/* Выберем правильный через radio */}
                            <Form.Item label="Выберите правильный вариант" shouldUpdate>
                              {() => {
                                const options = optionFields.map(fld=> form.getFieldValue(["questions", name, "options", fld.name]));
                                const answer = form.getFieldValue(["questions", name, "answer"]);
                                const current = options.findIndex(o => o === answer);
                                return (
                                  <Radio.Group
                                    value={current === -1 ? 0 : current}
                                    onChange={e => {
                                      const idx = e.target.value;
                                      form.setFieldValue(["questions", name, "answer"], options[idx]);
                                    }}
                                  >
                                    {options.map((_, idx) => (
                                      <Radio key={idx} value={idx}>{String.fromCharCode(97 + idx)})</Radio>
                                    ))}
                                  </Radio.Group>
                                );
                              }}
                            </Form.Item>
                            {optionFields.length < 8 && (
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
                      }
                    </Form.List>
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
