import {
  YoutubeFilled,
  InstagramFilled,
  WhatsAppOutlined,
  TikTokOutlined
} from "@ant-design/icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-teal-900 text-gray-200 border-t border-teal-800 pt-12 pb-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        {/* Лого + подпись */}
        <div className="min-w-[170px] mb-6 md:mb-0 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <img src="/newlogo.png" alt="NIS-BIL.online" className="w-20 h-20 rounded bg-white p-1" />
            <span className="text-lg font-bold text-gray-100 tracking-wide">NIS-BIL<span className="text-green-400">.online</span></span>
          </Link>
          <div className="text-sm text-gray-400">NIS-BIL<span className="text-green-400">.online</span> — онлайн‑платформа образования</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 flex-1">
          <div>
            <div className="font-semibold mb-4">Навигация</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:underline">Курсы</Link></li>
              <li><Link href="/tests" className="hover:underline">Тесты</Link></li>
              <li><Link href="/profile" className="hover:underline">Профиль</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4">Информация</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/offer" className="hover:underline">Публичная оферта</Link></li>
              <li><Link href="#" className="hover:underline">Статьи</Link></li>
              <li><Link href="#" className="hover:underline">Контакты</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4">Мы в соцсетях</div>
            <div className="flex gap-4 mt-2">
              <a href="https://www.instagram.com/dostyq.kyzylorda/?igsh=bWkzcTR6M2E5bjY4#" target="_blank" rel="noopener" title="Instagram" className="text-2xl text-gray-400 hover:text-green-400 transition"><InstagramFilled /></a>
              <a href="https://wa.me/77761555433" target="_blank" rel="noopener" title="WhatsApp" className="text-2xl text-gray-400 hover:text-green-400 transition"><WhatsAppOutlined /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
