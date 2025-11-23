"use client";
import { useEffect, useState } from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed z-50 right-6 bottom-28 md:right-7 md:bottom-28 bg-[#ffffff] hover:bg-white/30 text-teal-700 rounded-full shadow-lg flex items-center justify-center w-14 h-14 md:w-12 md:h-12 transition-colors"
      aria-label="Наверх"
    >
      <ArrowUpOutlined style={{ fontSize: 28, marginTop: -2 }} />
    </button>
  );
}
