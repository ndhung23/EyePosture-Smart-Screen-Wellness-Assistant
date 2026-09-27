'use client';

import React, { useState } from 'react';
import {
  Mail,
  Copy,
  Check,
  Send,
  HelpCircle,
  Clock,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';

export function SupportSection() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const SUPPORT_EMAIL = 'eyeposture@gmail.com';
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Form states
  const [category, setCategory] = useState('Bản quyền & Kích hoạt');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ success: boolean; text: string } | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setTicketResult(null);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email || '',
          category,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTicketResult({
          success: true,
          text: data.message || (isVi ? 'Yêu cầu của bạn đã được gửi thành công!' : 'Support ticket sent successfully!'),
        });
        setSubject('');
        setMessage('');
      } else {
        setTicketResult({
          success: false,
          text: data.error || (isVi ? 'Không thể gửi yêu cầu lúc này.' : 'Failed to send ticket.'),
        });
      }
    } catch {
      setTicketResult({
        success: false,
        text: isVi ? 'Lỗi kết nối máy chủ. Vui lòng gửi trực tiếp đến eyeposture@gmail.com' : 'Network error. Please email directly to eyeposture@gmail.com',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: isVi ? 'Làm sao để kích hoạt bản quyền trên app Desktop?' : 'How do I activate license on Desktop app?',
      a: isVi
        ? 'Bạn chỉ cần tải app Windows (.exe), mở ứng dụng và đăng nhập bằng cùng tài khoản email này. Hệ thống sẽ tự động cấp bản quyền Pro/Family mà không cần nhập key.'
        : 'Simply download the Windows installer (.exe), open the app, and sign in with this exact email account. License activates automatically.',
    },
    {
      q: isVi ? 'App báo không nhận diện được Camera AI hoặc bị gián đoạn?' : 'Camera AI disconnected or not detected?',
      a: isVi
        ? 'Hãy kiểm tra Settings Windows > Privacy & Security > Camera và bảo đảm quyền truy cập camera đã được bật cho ứng dụng. Bạn cũng có thể vào Cài đặt của EyePosture để chọn đúng thiết bị webcam.'
        : 'Check Windows Settings > Privacy & Security > Camera and ensure camera permissions are granted for EyePosture.',
    },
    {
      q: isVi ? 'Quy tắc 20-20-20 hoạt động như thế nào?' : 'How does the 20-20-20 rule work?',
      a: isVi
        ? 'Cứ sau mỗi 20 phút nhìn màn hình, ứng dụng sẽ nhắc bạn nhìn vào một vật thể cách xa ít nhất 20 feet (khoảng 6 mét) trong 20 giây để giảm mỏi mắt và chống khô giác mạc.'
        : 'Every 20 minutes of screen time, the assistant gently prompts you to look at an object 20 feet away for 20 seconds to prevent digital eye strain.',
    },
    {
      q: isVi ? 'Video từ camera có bị tải lên máy chủ không?' : 'Is my webcam video uploaded to the cloud?',
      a: isVi
        ? 'Tuyệt đối không. EyePosture xử lý thuật toán AI 100% On-Device trực tiếp trên CPU/NPU/GPU máy tính của bạn. Không một khung hình nào rời khỏi máy tính.'
        : 'Zero video uploads. EyePosture runs 100% On-Device local AI on your GPU/NPU. No video frame ever leaves your PC.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Official Support Channel Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-cyan-50/50 to-white dark:from-indigo-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white border border-indigo-200/80 dark:border-indigo-500/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{isVi ? 'Phản Hồi Trong 2 - 4 Giờ Làm Việc' : 'Response within 2 - 4 hours'}</span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isVi ? 'Kênh Hỗ Trợ Khách Hàng & Đối Tác' : 'Official Customer & Partner Support'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {isVi
                ? 'Đội ngũ kỹ sư và chăm sóc khách hàng EyePosture luôn sẵn sàng hỗ trợ bạn về bản quyền, cài đặt phần mềm, lỗi camera hoặc hợp tác tiếp thị.'
                : 'Our engineering & support team is ready to assist with licensing, desktop installation, camera AI, or affiliate partnerships.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-sm font-mono text-cyan-700 dark:text-cyan-400 flex items-center gap-2 select-all shadow-sm">
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{SUPPORT_EMAIL}</span>
            </div>

            <button
              onClick={handleCopyEmail}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedEmail ? (isVi ? 'Đã sao chép' : 'Copied') : (isVi ? 'Sao Chép Email' : 'Copy Email')}</span>
            </button>

            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[EyePosture Support] Yêu cầu hỗ trợ từ ${user?.email || 'Người dùng'}`)}`}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isVi ? 'Gửi Email Trực Tiếp' : 'Send Direct Email'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Direct Support Ticket Form & Quick FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Support Ticket Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {isVi ? 'Gửi Yêu Cầu Hỗ Trợ Nhanh' : 'Submit Support Ticket'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isVi ? 'Điền thông tin để kỹ thuật viên hỗ trợ bạn' : 'Fill details for immediate assistance'}
              </p>
            </div>
          </div>

          {ticketResult && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-medium mb-4 flex items-center gap-2.5 ${
                ticketResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
              }`}
            >
              {ticketResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{ticketResult.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Chủ đề / Phân loại:' : 'Category:'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Bản quyền & Kích hoạt">{isVi ? '🔑 Bản quyền & Kích hoạt gói Pro/Family' : 'License & Activation'}</option>
                <option value="Cài đặt & Lỗi app Desktop">{isVi ? '💻 Cài đặt & Lỗi app Windows (.exe)' : 'Desktop App & Installation'}</option>
                <option value="Camera AI & Nhận diện">{isVi ? '📷 Camera AI & Độ chính xác khoảng cách / tư thế' : 'Camera AI & Vision Engine'}</option>
                <option value="Tiếp thị Affiliate & Rút tiền">{isVi ? '💰 Tiếp thị Affiliate & Rút tiền hoa hồng' : 'Affiliate & Payouts'}</option>
                <option value="Góp ý tính năng mới">{isVi ? '💡 Góp ý tính năng mới' : 'Feature Request'}</option>
                <option value="Khác">{isVi ? 'Khác' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Tiêu đề vấn đề:' : 'Subject:'}
              </label>
              <input
                type="text"
                required
                placeholder={isVi ? 'ví dụ: Cần hỗ trợ kích hoạt gói Family trên máy thứ 2...' : 'e.g. Need help activating license on 2nd device...'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isVi ? 'Mô tả chi tiết:' : 'Detailed Message:'}
              </label>
              <textarea
                required
                rows={4}
                placeholder={isVi ? 'Mô tả chi tiết vấn đề bạn đang gặp phải hoặc thông tin cần giải đáp...' : 'Describe what happened or what you need assistance with...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-white hover:from-cyan-400 hover:to-indigo-500 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isVi ? 'Gửi Yêu Cầu Hỗ Trợ' : 'Submit Ticket'}</span>
            </button>
          </form>
        </div>

        {/* Quick Knowledge Base */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isVi ? 'Câu Hỏi Thường Gặp' : 'Knowledge Base'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isVi ? 'Giải đáp nhanh các vấn đề phổ biến' : 'Common questions answered'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                    {f.q}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>{isVi ? 'Cần hỗ trợ khẩn cấp?' : 'Urgent issue?'}</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>{SUPPORT_EMAIL}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
