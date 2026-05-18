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

    const html = `
      <h2>お問い合わせを受信しました</h2>
      <p><strong>ご氏名:</strong> ${body.name}</p>
      <p><strong>会社名:</strong> ${body.company}</p>
      <p><strong>メールアドレス:</strong> ${body.email}</p>
      <p><strong>電話番号:</strong> ${body.phone || '未入力'}</p>
      <p><strong>お問い合わせ内容:</strong> ${inquiryLabel(String(body.inquiry))}</p>
      <p><strong>メッセージ:</strong><br/>${(body.message || '').replace(/\n/g, '<br/>')}</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `【お問い合わせ】${body.company} / ${body.name}`,
        reply_to: body.email,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return json({ error: `メール送信に失敗しました: ${errorText}` }, 500);
    }

    return json({ success: true, message: 'メッセージが送信されました' });
  } catch {
    return json({ error: 'サーバーエラーが発生しました' }, 500);
  }
};
