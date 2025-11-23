"use client";
import { WhatsAppOutlined } from "@ant-design/icons";

export default function FloatingWhatsapp() {
  return (
    <a
      href="https://wa.me/77761555433"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-50 right-6 bottom-6 md:right-7 md:bottom-7 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-full shadow-lg flex items-center justify-center w-12 h-12 md:w-12 md:h-12"
      aria-label="WhatsApp"
      style={{ boxShadow: "0 4px 16px 0 rgba(60,240,60,0.18)" }}
    >
      <WhatsAppOutlined />
    </a>
  );
}
