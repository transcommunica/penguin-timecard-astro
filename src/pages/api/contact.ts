import type { APIRoute } from 'astro';

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

function inquiryLabel(inquiry: string): string {
  if (inquiry === 'feature') return '機能について';
  if (inquiry === 'pricing') return '料金について';
  return 'その他';
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
  return escapeHtml(value).replace(/\n/g, '<br/>');
}

async function sendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
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
      to: [params.to],
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as ContactPayload;

    if (!body.name || !body.company || !body.email || !body.inquiry) {
      return json({ error: '必須項目が不足しています' }, 400);
    }

    const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env;
    const apiKey = runtimeEnv?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
    const fromEmail = runtimeEnv?.CONTACT_FROM_EMAIL ?? import.meta.env.CONTACT_FROM_EMAIL;
    const toEmail = runtimeEnv?.CONTACT_TO_EMAIL ?? import.meta.env.CONTACT_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      return json({ error: 'メール送信設定が不足しています' }, 500);
    }

    const safeName = escapeHtml(body.name);
    const safeCompany = escapeHtml(body.company);
    const safeEmail = escapeHtml(body.email);
    const safePhone = body.phone ? escapeHtml(body.phone) : '未入力';
    const safeInquiry = escapeHtml(inquiryLabel(String(body.inquiry)));
    const safeMessage = formatMultilineHtml(body.message);

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

    await sendEmail({
      apiKey,
      from: fromEmail,
      to: toEmail,
      subject: `【お問い合わせ】${body.company} / ${body.name}`,
      replyTo: body.email,
      html: notificationHtml,
    });

    await sendEmail({
      apiKey,
      from: fromEmail,
      to: body.email,
      subject: '【ペンギンタイムカード】お問い合わせありがとうございます',
      html: autoReplyHtml,
    });

    return json({ success: true, message: 'メッセージが送信されました' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'サーバーエラーが発生しました';
    return json({ error: `メール送信に失敗しました: ${message}` }, 500);
  }
};
