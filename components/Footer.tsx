import {
  YoutubeFilled,
  InstagramFilled,
  WhatsAppOutlined,
  TikTokOutlined
} from "@ant-design/icons";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#161a23] text-gray-200 border-t border-[#21283a] pt-12 pb-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        {/* Лого + подпись */}
        <div className="min-w-[170px] mb-6 md:mb-0 flex-shrink-0">
          <div className="flex items-center gap-2 mb-5">
            <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded bg-white p-1" />
            <span className="text-lg font-bold text-gray-100 tracking-wide">BIL <span className="text-blue-400">NIS</span></span>
          </div>
          <div className="text-sm text-gray-400">BIL NIS — онлайн‑платформа образования</div>
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
              <a href="https://instagram.com/" target="_blank" rel="noopener" title="Instagram" className="text-2xl text-gray-400 hover:text-[#27b1ff] transition"><InstagramFilled /></a>
              <a href="https://wa.me/77012345678" target="_blank" rel="noopener" title="WhatsApp" className="text-2xl text-gray-400 hover:text-[#27b1ff] transition"><WhatsAppOutlined /></a>
              <a href="https://youtube.com/" target="_blank" rel="noopener" title="YouTube" className="text-2xl text-gray-400 hover:text-[#27b1ff] transition"><YoutubeFilled /></a>
              <a href="https://tiktok.com/" target="_blank" rel="noopener" title="TikTok" className="text-2xl text-gray-400 hover:text-[#27b1ff] transition"><TikTokOutlined /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
