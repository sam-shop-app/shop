import nodemailer from 'nodemailer';

// 这是一个模拟的邮件发送服务
// 在生产环境中，你需要配置真实的 SMTP 服务器
export async function sendEmail(to: string, subject: string, html: string) {
  // 在开发环境中，只打印日志
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Email would be sent:', {
      to,
      subject,
      html
    });
    return true;
  }

  // 生产环境配置
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"山姆闪购超市" <noreply@sam-supermarket.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// 模拟的短信发送服务
export async function sendSMS(phone: string, message: string) {
  // 在开发环境中，只打印日志
  if (process.env.NODE_ENV !== 'production') {
    console.log('📱 SMS would be sent:', {
      phone,
      message
    });
    return true;
  }

  // 生产环境中，这里应该调用真实的短信服务 API
  // 例如：阿里云短信、腾讯云短信等
  console.log('SMS service not configured');
  return true;
}

export function getVerificationCodeTemplate(code: string, purpose: 'login' | 'register'): string {
  const purposeText = purpose === 'login' ? '登录' : '注册';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">山姆闪购超市 - 验证码</h2>
      <p>您正在进行${purposeText}操作，您的验证码是：</p>
      <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
        ${code}
      </div>
      <p>验证码有效期为5分钟，请尽快使用。</p>
      <p style="color: #666; font-size: 14px;">如果这不是您的操作，请忽略此邮件。</p>
    </div>
  `;
}

export function getSMSTemplate(code: string, purpose: 'login' | 'register'): string {
  const purposeText = purpose === 'login' ? '登录' : '注册';
  return `【山姆闪购】您的${purposeText}验证码是：${code}，5分钟内有效。`;
}