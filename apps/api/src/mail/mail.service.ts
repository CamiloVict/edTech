import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const DEFAULT_SUPPORT_INBOX = 'camiloavict+edify@gmail.com';

export type TicketCreatedMailPayload = {
  ticketId: string;
  appointmentId: string;
  categoryLabel: string;
  categoryCode: string;
  status: string;
  formalComplaint: boolean;
  formalTrackingNumber: string | null;
  creatorEmail: string;
  creatorName: string | null;
  consumerEmail: string;
  consumerName: string | null;
  providerEmail: string;
  providerName: string | null;
  initialMessage?: string | null;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP no configurado (SMTP_HOST, SMTP_USER, SMTP_PASS): los avisos de ticket no se envían por correo.',
      );
    }
  }

  isConfigured(): boolean {
    return this.transporter != null;
  }

  private fromAddress(): string {
    return (
      process.env.MAIL_FROM?.trim() ??
      process.env.SMTP_USER?.trim() ??
      'noreply@trofoschool.local'
    );
  }

  supportInbox(): string {
    return process.env.SUPPORT_NOTIFY_EMAIL?.trim() ?? DEFAULT_SUPPORT_INBOX;
  }

  private async sendSafe(to: string, subject: string, text: string): Promise<void> {
    if (!this.transporter) return;
    const t = to.trim().toLowerCase();
    if (!t || !t.includes('@')) return;
    try {
      await this.transporter.sendMail({
        from: this.fromAddress(),
        to: t,
        subject,
        text,
      });
      this.logger.log(`Correo enviado a ${t}: ${subject.slice(0, 40)}…`);
    } catch (err) {
      this.logger.error(
        `No se pudo enviar correo a ${t}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  /** Aviso a soporte + creador + familia + educador (sin duplicar misma dirección). */
  async notifyTicketCreated(p: TicketCreatedMailPayload): Promise<void> {
    const trimmedMsg = p.initialMessage?.trim();
    const detailBlock = trimmedMsg
      ? `\n\nDetalle enviado:\n${trimmedMsg}`
      : '';

    const supportTo = this.supportInbox();
    const linesCommon = [
      `Ticket: ${p.ticketId}`,
      `Cita: ${p.appointmentId}`,
      `Categoría: ${p.categoryLabel} (${p.categoryCode})`,
      `Estado: ${p.status}`,
      p.formalComplaint && p.formalTrackingNumber
        ? `PQR / seguimiento: ${p.formalTrackingNumber}`
        : null,
      p.initialMessage?.trim()
        ? `Mensaje inicial:\n${p.initialMessage.trim()}`
        : null,
      '',
      `Quién abrió el ticket: ${p.creatorName ?? '—'} <${p.creatorEmail}>`,
      `Familia (cuenta): ${p.consumerName ?? '—'} <${p.consumerEmail}>`,
      `Educador (cuenta): ${p.providerName ?? '—'} <${p.providerEmail}>`,
    ]
      .filter(Boolean)
      .join('\n');

    await this.sendSafe(
      supportTo,
      `[Edify] Nuevo ticket de soporte · ${p.categoryCode}`,
      `Hay un nuevo ticket en Edify.\n\n${linesCommon}`,
    );

    const norm = (e: string) => e.trim().toLowerCase();

    type Recipient = { email: string; subject: string; body: string };
    const out: Recipient[] = [];

    const creatorNorm = norm(p.creatorEmail);
    out.push({
      email: p.creatorEmail,
      subject: '[Edify] Hemos registrado tu solicitud de ayuda',
      body: `Hola${p.creatorName ? ` ${p.creatorName}` : ''},\n\n` +
        `Tu ticket quedó registrado (ID: ${p.ticketId}).\n` +
        `Categoría: ${p.categoryLabel}.\n` +
        (p.formalTrackingNumber
          ? `Número de seguimiento (PQR): ${p.formalTrackingNumber}\n`
          : '') +
        detailBlock +
        `\n\nPuedes seguir el hilo en la app.\n\n` +
        `— Edify`,
    });

    if (norm(p.consumerEmail) !== creatorNorm) {
      out.push({
        email: p.consumerEmail,
        subject: '[Edify] Aviso sobre una cita (ticket de soporte)',
        body: `Hola${p.consumerName ? ` ${p.consumerName}` : ''},\n\n` +
          `Se ha abierto un ticket de soporte vinculado a una cita en la que participas.\n` +
          `Categoría: ${p.categoryLabel}.\n` +
          `Quien lo abrió: ${p.creatorName ?? p.creatorEmail}.\n` +
          (p.formalTrackingNumber
            ? `Seguimiento formal: ${p.formalTrackingNumber}\n`
            : '') +
          detailBlock +
          `\n\nID del ticket: ${p.ticketId}\n\n` +
          `— Edify`,
      });
    }

    const providerNorm = norm(p.providerEmail);
    if (
      providerNorm !== creatorNorm &&
      providerNorm !== norm(p.consumerEmail)
    ) {
      out.push({
        email: p.providerEmail,
        subject: '[Edify] Aviso sobre una cita (ticket de soporte)',
        body: `Hola${p.providerName ? ` ${p.providerName}` : ''},\n\n` +
          `Se ha abierto un ticket de soporte vinculado a una cita en la que participas.\n` +
          `Categoría: ${p.categoryLabel}.\n` +
          `Quien lo abrió: ${p.creatorName ?? p.creatorEmail}.\n` +
          (p.formalTrackingNumber
            ? `Seguimiento formal: ${p.formalTrackingNumber}\n`
            : '') +
          detailBlock +
          `\n\nID del ticket: ${p.ticketId}\n\n` +
          `— Edify`,
      });
    }

    const sent = new Set<string>();
    for (const r of out) {
      const k = norm(r.email);
      if (sent.has(k)) continue;
      sent.add(k);
      await this.sendSafe(r.email, r.subject, r.body);
    }
  }
}
