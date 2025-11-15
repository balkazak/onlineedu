"use client";

import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[9999]">
      <div className="text-center">
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: "#1890ff" }} spin />} 
          size="large"
        />
        <p className="mt-4 text-gray-600 text-lg">Загрузка...</p>
      </div>
    </div>
  );
}

