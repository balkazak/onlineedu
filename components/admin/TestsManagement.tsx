"use client";

import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, InputNumber, Select, Tag, Radio, Upload } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Test, TestQuestion } from "@/lib/types";
import { getAllTests, createTest, updateTest, deleteTest, getAllUsers, uploadImage } from "@/lib/api";

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
        qImage: "",
        options: [
          { label: 'a', text: '' },
          { label: 'b', text: '' },
          { label: 'c', text: '' },
          { label: 'd', text: '' }
        ],
        answer: 'a'
      }],
      timeLimit: 30,
      allowedUsers: []
    });
    setModalVisible(true);
  };

  const handleEdit = (test: Test) => {
    // transform test structure to form-friendly shape (support legacy options as strings)
    setEditingTest(test);
    const questions = (test.questions || []).map((q, qi) => {
      const options = (q.options || []).map((opt: any, idx: number) => {
        if (typeof opt === 'string') {
          return { label: String.fromCharCode(97 + idx), text: opt, image: undefined };
        }
        return { label: opt.label || String.fromCharCode(97 + idx), text: opt.text || (opt || '').toString(), image: opt.image };
      });
      // ensure at least 4 options
      for (let i = options.length; i < 4; i++) options.push({ label: String.fromCharCode(97 + i), text: '', image: undefined });

      // determine answer label: if answer matches option.label use it, else if matches option.text find index
      let answerLabel = q.answer || 'a';
      if (!options.find(o => o.label === answerLabel)) {
        const foundIdx = options.findIndex(o => o.text === q.answer);
        answerLabel = foundIdx === -1 ? 'a' : options[foundIdx].label;
      }

      const qImageFile = (q as any).qImage ? [{ uid: '-1', name: 'image.jpg', status: 'done', url: (q as any).qImage }] : [];
      const optsWithFiles = options.map((opt: any, idx: number) => {
        if (opt.image) {
          return { ...opt, imageFile: [{ uid: `-${idx}`, name: 'image.jpg', status: 'done', url: opt.image }] };
        }
        return opt;
      });

      return { q: q.q || '', qImage: (q as any).qImage || '', qImageFile, options: optsWithFiles, answer: answerLabel };
    });

    form.setFieldsValue({ ...test, questions });
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
    const processedQuestions: TestQuestion[] = await Promise.all((values.questions || []).map(async (q: any, qi: number) => {
      const question: any = { q: q.q || '', options: [], answer: q.answer };

      // handle question image upload or URL
      if (q.qImageFile && Array.isArray(q.qImageFile) && q.qImageFile.length > 0) {
        const fileItem = q.qImageFile[0];
        if (fileItem.originFileObj) {
          const file = fileItem.originFileObj;
          if (file instanceof File) {
            const imagePath = `tests/questions/${Date.now()}-${qi}-q.jpg`;
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
        question.options = await Promise.all(q.options.map(async (opt: any, oi: number) => {
          const option: any = { label: opt.label || String.fromCharCode(97 + oi), text: opt.text || '' };

          if (opt.imageFile && Array.isArray(opt.imageFile) && opt.imageFile.length > 0) {
            const fileItem = opt.imageFile[0];
            if (fileItem.originFileObj) {
              const file = fileItem.originFileObj;
              if (file instanceof File) {
                const imagePath = `tests/questions/${Date.now()}-${qi}-options-${oi}.jpg`;
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

      return question as TestQuestion;
    }));

    const questions = (processedQuestions || []).filter((q: TestQuestion) => {
      const hasQuestionContent = q.q || q.qImage; // text or image
      const hasValidOptions = q.options && q.options.length >= 2 && q.options.some(opt => opt.text || opt.image); // at least 2 options with content
      return hasQuestionContent && hasValidOptions && q.answer;
    });

    if (questions.length === 0) {
      message.error("Добавьте хотя бы один вопрос с текстом или картинкой, минимум 2 вариантами ответа");
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
                      rules={[
                        {
                          validator: (_, value) => {
                            const qImageFile = form.getFieldValue(['questions', name, 'qImageFile']);
                            const hasImage = qImageFile && Array.isArray(qImageFile) && qImageFile.length > 0;
                            if (!value && !hasImage) {
                              return Promise.reject(new Error("Введите вопрос или загрузите картинку"));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <Input placeholder="Текст вопроса (или загрузите картинку)" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "qImageFile"]}
                      label="Картинка к вопросу"
                      getValueFromEvent={(e) => {
                        if (Array.isArray(e)) return e;
                        return e?.fileList;
                      }}
                      valuePropName="fileList"
                    >
                      <Upload
                        beforeUpload={(file) => {
                          const isImage = file.type && file.type.startsWith('image/');
                          if (!isImage) {
                            message.error('Можно загружать только изображения!');
                            return Upload.LIST_IGNORE;
                          }
                          return false;
                        }}
                        listType="picture"
                        maxCount={1}
                        defaultFileList={(() => {
                          const qImage = form.getFieldValue(['questions', name, 'qImage']);
                          if (qImage) {
                            return [{ uid: '-1', name: 'image.jpg', status: 'done', url: qImage }];
                          }
                          return [];
                        })()}
                      >
                        <Button icon={<UploadOutlined />}>Загрузить картинку</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'qImage']}
                      hidden
                    >
                      <Input type="hidden" />
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
                              <div key={fld.key} className="mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8">
                                    <span className="font-semibold">{String.fromCharCode(97 + idx)})</span>
                                  </div>
                                  <div className="flex-1">
                                    <Form.Item
                                      {...fld}
                                      name={[fld.name, "text"]}
                                      rules={[
                                        {
                                          validator: (_, value) => {
                                            const optionImageFile = form.getFieldValue(['questions', name, 'options', fld.name, 'imageFile']);
                                            const hasImage = optionImageFile && Array.isArray(optionImageFile) && optionImageFile.length > 0;
                                            if (!value && !hasImage) {
                                              return Promise.reject(new Error("Введите вариант или загрузите картинку"));
                                            }
                                            return Promise.resolve();
                                          }
                                        }
                                      ]}
                                      className="mb-1"
                                    >
                                      <Input placeholder={`Вариант ${String.fromCharCode(97 + idx)} (или загрузите картинку)`} />
                                    </Form.Item>
                                    <Form.Item
                                      {...fld}
                                      name={[fld.name, "imageFile"]}
                                      getValueFromEvent={(e) => {
                                        if (Array.isArray(e)) return e;
                                        return e?.fileList;
                                      }}
                                      valuePropName="fileList"
                                      className="mb-1"
                                    >
                                      <Upload
                                        beforeUpload={(file) => {
                                          const isImage = file.type && file.type.startsWith('image/');
                                          if (!isImage) {
                                            message.error('Можно загружать только изображения!');
                                            return Upload.LIST_IGNORE;
                                          }
                                          return false;
                                        }}
                                        listType="picture"
                                        maxCount={1}
                                        defaultFileList={(() => {
                                          const optImage = form.getFieldValue(['questions', name, 'options', fld.name, 'image']);
                                          if (optImage) {
                                            return [{ uid: `-${fld.name}`, name: 'image.jpg', status: 'done', url: optImage }];
                                          }
                                          return [];
                                        })()}
                                      >
                                        <Button size="small" icon={<UploadOutlined />}>Картинка</Button>
                                      </Upload>
                                    </Form.Item>
                                    <Form.Item
                                      {...fld}
                                      name={[fld.name, 'image']}
                                      hidden
                                    >
                                      <Input type="hidden" />
                                    </Form.Item>
                                  </div>
                                  {optionFields.length > 4 && idx >= 4 && (
                                    <Button danger size="small" onClick={() => removeOption(fld.name)}>
                                      Удалить
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <Form.Item label="Выберите правильный вариант" shouldUpdate>
                              {() => {
                                const options = optionFields.map(fld => form.getFieldValue(["questions", name, "options", fld.name]) || { label: String.fromCharCode(97 + 0) });
                                const answer = form.getFieldValue(["questions", name, "answer"]);
                                const current = options.findIndex((o: any) => o && o.label === answer);
                                return (
                                  <Radio.Group
                                    value={current === -1 ? 0 : current}
                                    onChange={e => {
                                      const idx = e.target.value;
                                      const opt = options[idx];
                                      form.setFieldValue(["questions", name, "answer"], opt?.label || String.fromCharCode(97 + idx));
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
