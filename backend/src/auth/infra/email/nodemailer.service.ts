import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { SendEmailInterface } from '../../app/ports/SendEmailInterface';

type EmailLang = Record<string, string>;
type EmailTranslations = Record<string, EmailLang>;

const TRANSLATIONS: EmailTranslations = {
  es: {
    subtitle: 'Tu aliado para cuidar la salud con calma y motivaci\u00f3n',
    subject: 'Recuperaci\u00f3n de contrase\u00f1a - SugarCheck',
    greeting: 'Hola',
    body: 'Recibimos una solicitud para recuperar el acceso a tu cuenta en SugarCheck. Para continuar, usa el siguiente c\u00f3digo de verificaci\u00f3n.',
    codeInstruction: 'Ingresa este c\u00f3digo en la app para restablecer tu acceso. Si no solicitaste este cambio, puedes ignorar este mensaje.',
    cta: 'Volver a la app',
    importantTitle: 'Importante',
    importantText: 'Este c\u00f3digo expira en 10 minutos. Si el tiempo termina, solicita uno nuevo desde la pantalla de recuperaci\u00f3n.',
    securityTitle: 'Seguridad',
    securityText: 'No compartas este c\u00f3digo con nadie. SugarCheck nunca te pedir\u00e1 tu contrase\u00f1a por correo.',
    footer: 'Este mensaje fue enviado por SugarCheck.',
    footerContact: 'Si tienes dudas, responde a este correo o cont\u00e1ctanos a trav\u00e9s de la app.',
    devLog: 'Email de recuperaci\u00f3n:',
    devCode: 'C\u00f3digo:',
  },
  en: {
    subtitle: 'Your ally to take care of your health with calm and motivation',
    subject: 'Password recovery - SugarCheck',
    greeting: 'Hello',
    body: 'We received a request to recover access to your SugarCheck account. To continue, use the following verification code.',
    codeInstruction: 'Enter this code in the app to reset your access. If you did not request this change, you can ignore this message.',
    cta: 'Back to app',
    importantTitle: 'Important',
    importantText: 'This code expires in 10 minutes. If time runs out, request a new one from the recovery screen.',
    securityTitle: 'Security',
    securityText: 'Do not share this code with anyone. SugarCheck will never ask for your password by email.',
    footer: 'This message was sent by SugarCheck.',
    footerContact: 'If you have questions, reply to this email or contact us through the app.',
    devLog: 'Recovery email:',
    devCode: 'Code:',
  },
  pt: {
    subtitle: 'Seu aliado para cuidar da sa\u00fade com calma e motiva\u00e7\u00e3o',
    subject: 'Recupera\u00e7\u00e3o de senha - SugarCheck',
    greeting: 'Ol\u00e1',
    body: 'Recebemos uma solicita\u00e7\u00e3o para recuperar o acesso \u00e0 sua conta no SugarCheck. Para continuar, use o seguinte c\u00f3digo de verifica\u00e7\u00e3o.',
    codeInstruction: 'Insira este c\u00f3digo no aplicativo para redefinir seu acesso. Se n\u00e3o solicitou esta altera\u00e7\u00e3o, ignore esta mensagem.',
    cta: 'Voltar ao app',
    importantTitle: 'Importante',
    importantText: 'Este c\u00f3digo expira em 10 minutos. Se o tempo acabar, solicite um novo na tela de recupera\u00e7\u00e3o.',
    securityTitle: 'Seguran\u00e7a',
    securityText: 'N\u00e3o compartilhe este c\u00f3digo com ningu\u00e9m. O SugarCheck nunca pedir\u00e1 sua senha por e-mail.',
    footer: 'Esta mensagem foi enviada pelo SugarCheck.',
    footerContact: 'Se tiver d\u00favidas, responda a este e-mail ou entre em contato pelo aplicativo.',
    devLog: 'E-mail de recupera\u00e7\u00e3o:',
    devCode: 'C\u00f3digo:',
  },
  ja: {
    subtitle: '\u304a\u3093\u306a\u306e\u5065\u5eb7\u3092\u9759\u304b\u306a\u5fc3\u3067\u5927\u5207\u306b\u3059\u308b\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8',
    subject: '\u30d1\u30b9\u30ef\u30fc\u30c9\u30ea\u30bb\u30c3\u30c8 - SugarCheck',
    greeting: '\u3053\u3093\u306b\u3061\u306f',
    body: 'SugarCheck\u30a2\u30ab\u30a6\u30f3\u30c8\u3078\u306e\u30a2\u30af\u30bb\u30b9\u5fa9\u5e30\u306e\u30ea\u30af\u30a8\u30b9\u30c8\u3092\u53d7\u3051\u4ed8\u3051\u307e\u3057\u305f\u3002\u7d9a\u3051\u308b\u306b\u306f\u3001\u4ee5\u4e0b\u306e\u78ba\u8a8d\u30b3\u30fc\u30c9\u3092\u4f7f\u7528\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    codeInstruction: '\u3053\u306e\u30b3\u30fc\u30c9\u3092\u30a2\u30d7\u30ea\u306b\u5165\u529b\u3057\u3066\u30a2\u30af\u30bb\u30b9\u3092\u5fa9\u5e30\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u3053\u306e\u5909\u66f4\u3092\u30ea\u30af\u30a8\u30b9\u30c8\u3057\u3066\u3044\u306a\u3044\u5834\u5408\u306f\u3001\u3053\u306e\u30e1\u30c3\u30bb\u30fc\u30b8\u3092\u7121\u8996\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    cta: '\u30a2\u30d7\u30ea\u306b\u623b\u308b',
    importantTitle: '\u91cd\u8981',
    importantText: '\u3053\u306e\u30b3\u30fc\u30c9\u306f10\u5206\u3067\u6709\u52b9\u671f\u304c\u5207\u308c\u307e\u3059\u3002\u6642\u9593\u304c\u5207\u308c\u305f\u5834\u5408\u306f\u3001\u5fa9\u5e30\u753b\u9762\u304b\u3089\u65b0\u3057\u3044\u30b3\u30fc\u30c9\u3092\u30ea\u30af\u30a8\u30b9\u30c8\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    securityTitle: '\u30bb\u30ad\u30e5\u30ea\u30c6\u30a3',
    securityText: '\u3053\u306e\u30b3\u30fc\u30c9\u3092\u8ab0\u304b\u3068\u5171\u6709\u3057\u306a\u3044\u3067\u304f\u3060\u3055\u3044\u3002SugarCheck\u304c\u30e1\u30fc\u30eb\u3067\u30d1\u30b9\u30ef\u30fc\u30c9\u3092\u554f\u3044\u5408\u308f\u305b\u308b\u3053\u3068\u306f\u3042\u308a\u307e\u305b\u3093\u3002',
    footer: '\u3053\u306e\u30e1\u30c3\u30bb\u30fc\u30b8\u306fSugarCheck\u304b\u3089\u9001\u4fe1\u3055\u308c\u307e\u3057\u305f\u3002',
    footerContact: '\u304a\u554f\u3044\u5408\u308f\u305b\u304c\u3042\u308c\u3070\u3001\u3053\u306e\u30e1\u30fc\u30eb\u306b\u5fdc\u7b54\u3059\u308b\u304b\u3001\u30a2\u30d7\u30ea\u304b\u3089\u304a\u554f\u3044\u5408\u308f\u305b\u304f\u3060\u3055\u3044\u3002',
    devLog: '\u30ea\u30bb\u30c3\u30c8\u30e1\u30fc\u30eb:',
    devCode: '\u30b3\u30fc\u30c9:',
  },
};

@Injectable()
export class NodemailerService implements SendEmailInterface {
  private transporter: Transporter;
  private readonly frontendUrl: string;
  private readonly from: string;
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const emailUser = this.configService.get<string>('EMAIL_USER', '');
    const emailFrom = this.configService.get<string>('EMAIL_FROM');
    this.from = emailFrom || emailUser;
    this.isDev = this.configService.get<string>('NODE_ENV') === 'development';

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false,
      auth: { user: emailUser, pass: this.configService.get<string>('EMAIL_PASS', '') },
    });
  }

  private t(lang: string): EmailLang {
    return TRANSLATIONS[lang] || TRANSLATIONS.es;
  }

  private baseHtml(bodyContent: string, lang: string): string {
    const txt = this.t(lang);
    const logoSrc = 'https://ccjanucsoycipueisyzd.supabase.co/storage/v1/object/public/assets/SugarCheck.svg';
    return `
<div style="font-family: 'Poppins', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(61, 88, 108, 0.16);">
  <div style="background: #95BFDF; padding: 28px 24px; text-align: center;">
    <img src="${logoSrc}" alt="SugarCheck" width="72" height="72" style="display: inline-block; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);" />
    <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700;">SugarCheck</h1>
    <p style="margin: 8px 0 0; color: #f2f7fb; font-size: 15px;">${txt.subtitle}</p>
  </div>
  <div style="padding: 32px 28px 24px;">${bodyContent}</div>
  <div style="padding: 20px 28px 32px; font-size: 12px; color: #f2f7fb; text-align: center; background-color: #3d586c;">
    <p style="margin: 0;">${txt.footer}</p>
    <p style="margin: 8px 0 0;">${txt.footerContact}</p>
  </div>
</div>`;
  }

  async sendResetPasswordEmail(to: string, code: string, name: string, lang = 'es'): Promise<void> {
    const txt = this.t(lang);
    const urlAccion = `${this.frontendUrl}/restablecer-contrasena?email=${encodeURIComponent(to)}&code=${code}`;

    if (this.isDev && !this.configService.get<string>('EMAIL_USER')) {
      console.log('========================================');
      console.log(`[DEV] ${txt.devLog}`);
      console.log(`  Para: ${to}`);
      console.log(`  ${txt.devCode} ${code}`);
      console.log(`  URL: ${urlAccion}`);
      console.log('========================================');
      return;
    }

    const body = `
    <p style="font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #1a202c;">${txt.greeting} ${name},</p>
    <p style="font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 20px;">${txt.body}</p>
    <div style="display: inline-block; background: #95BFDF; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 4px; padding: 14px 22px; border-radius: 12px; margin: 8px 0 20px;">${code}</div>
    <p style="font-size: 16px; line-height: 1.7; color: #4a5568; margin: 0 0 20px;">${txt.codeInstruction}</p>
    <a href="${urlAccion}" style="display: inline-block; background: #95BFDF; color: #ffffff; text-decoration: none; padding: 13px 24px; border-radius: 999px; font-weight: 600; margin: 8px 0 24px;">${txt.cta}</a>
    <div style="background: #f2f7fb; border: 1px solid #d7e7f3; border-radius: 12px; padding: 18px; margin: 18px 0;">
      <h3 style="margin: 0 0 8px; font-size: 18px; color: #3d586c;">${txt.importantTitle}</h3>
      <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">${txt.importantText}</p>
    </div>
    <div style="background: #f2f7fb; border: 1px solid #d7e7f3; border-radius: 12px; padding: 18px; margin: 18px 0;">
      <h3 style="margin: 0 0 8px; font-size: 18px; color: #3d586c;">${txt.securityTitle}</h3>
      <p style="margin: 0; font-size: 14px; color: #4a5568; line-height: 1.6;">${txt.securityText}</p>
    </div>`;

    await this.transporter.sendMail({
      from: `"SugarCheck" <${this.from}>`,
      to,
      subject: txt.subject,
      html: this.baseHtml(body, lang),
    });
  }
}
