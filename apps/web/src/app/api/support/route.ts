import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SupportTicket {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  category: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

const SUPPORT_FILE = path.join(process.cwd(), 'data', 'support_tickets.json');

function loadTickets(): SupportTicket[] {
  try {
    if (fs.existsSync(SUPPORT_FILE)) {
      return JSON.parse(fs.readFileSync(SUPPORT_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading support tickets:', err);
  }
  return [];
}

function saveTickets(tickets: SupportTicket[]) {
  try {
    const dir = path.dirname(SUPPORT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving support tickets:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, userEmail, category, subject, message } = body;

    if (!userEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đầy đủ email, tiêu đề và nội dung cần hỗ trợ.' },
        { status: 400 }
      );
    }

    const tickets = loadTickets();
    const newTicket: SupportTicket = {
      id: `TCK-${Date.now().toString().slice(-6)}`,
      userId: userId || undefined,
      userName: userName || userEmail.split('@')[0],
      userEmail: userEmail.trim().toLowerCase(),
      category: category || 'Chung',
      subject: subject.trim(),
      message: message.trim(),
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    saveTickets(tickets);

    console.log(`[Support] Nhận ticket mới #${newTicket.id} từ ${newTicket.userEmail} -> Kênh chính: eyeposture@gmail.com`);

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu hỗ trợ đã được tiếp nhận thành công. Đội ngũ EyePosture sẽ phản hồi qua email của bạn trong vòng 2-4 giờ làm việc.',
      ticketId: newTicket.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lỗi xử lý yêu cầu' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('email');
  const tickets = loadTickets();

  if (userEmail) {
    const clean = userEmail.trim().toLowerCase();
    const filtered = tickets.filter((t) => t.userEmail === clean);
    return NextResponse.json({ tickets: filtered });
  }

  return NextResponse.json({ tickets });
}
