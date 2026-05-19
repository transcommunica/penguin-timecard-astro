type Env = {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
};

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  inquiry?: 'feature' | 'pricing' | 'other' | string;
  message?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMultilineHtml(value?: string): string {
  if (!value) return '未入力';
  return escapeHtml(value).replace(/\r?\n/g, '<br/>');
}

function inquiryLabel(inquiry: string): string {
  if (inquiry === 'feature') return '機能について';
  if (inquiry === 'pricing') return '料金について';
  return 'その他';
}

function parseRecipients(value?: string): string[] {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function sendHtmlEmail(params: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  try {
    let body: ContactPayload;
    try {
      body = (await context.request.json()) as ContactPayload;
    } catch {
      return json({ error: 'リクエスト形式が正しくありません' }, 400);
    }

    const name = String(body.name || '').trim();
    const company = String(body.company || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const inquiry = String(body.inquiry || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !company || !email || !inquiry) {
      return json({ error: '必須項目が不足しています' }, 400);
    }

    if (!isLikelyEmail(email)) {
      return json({ error: 'メールアドレスの形式が正しくありません' }, 400);
    }

    const apiKey = String(context.env.RESEND_API_KEY || '').trim();
    const fromEmail = String(context.env.CONTACT_FROM_EMAIL || '').trim();
    const toEmails = parseRecipients(context.env.CONTACT_TO_EMAIL);

    if (!apiKey || !fromEmail || toEmails.length === 0) {
      return json({ error: 'メール送信設定が不足しています' }, 500);
    }

    const safeName = escapeHtml(name);
    const safeCompany = escapeHtml(company);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : '未入力';
    const safeInquiry = escapeHtml(inquiryLabel(inquiry));
    const safeMessage = formatMultilineHtml(message);

    const notificationHtml = `
      <h2>お問い合わせを受信しました</h2>
      <p><strong>ご氏名:</strong> ${safeName}</p>
      <p><strong>会社名:</strong> ${safeCompany}</p>
      <p><strong>メールアドレス:</strong> ${safeEmail}</p>
      <p><strong>電話番号:</strong> ${safePhone}</p>
      <p><strong>お問い合わせ内容:</strong> ${safeInquiry}</p>
      <p><strong>メッセージ:</strong><br/>${safeMessage}</p>
    `;

    const autoReplyHtml = `
      <p>${safeName} 様</p>
      <p>お問い合わせありがとうございます。以下の内容で受け付けました。</p>
      <hr />
      <p><strong>会社名:</strong> ${safeCompany}</p>
      <p><strong>メールアドレス:</strong> ${safeEmail}</p>
      <p><strong>電話番号:</strong> ${safePhone}</p>
      <p><strong>お問い合わせ内容:</strong> ${safeInquiry}</p>
      <p><strong>メッセージ:</strong><br/>${safeMessage}</p>
      <hr />
      <p>内容を確認のうえ、担当者よりご連絡いたします。</p>
      <p>このメールは自動送信されています。心当たりがない場合は破棄してください。</p>
    `;

    await sendHtmlEmail({
      apiKey,
      from: fromEmail,
      to: toEmails,
      subject: `【お問い合わせ】${company} / ${name}`,
      replyTo: email,
      html: notificationHtml,
    });

    await sendHtmlEmail({
      apiKey,
      from: fromEmail,
      to: [email],
      subject: '【ペンギンタイムカード】お問い合わせありがとうございます',
      html: autoReplyHtml,
    });

    return json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'サーバーエラーが発生しました';
    return json({ error: `メール送信に失敗しました: ${message}` }, 500);
  }
};