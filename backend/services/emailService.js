import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Email templates
const emailTemplates = {
    ticketCreated: (ticket) => ({
        subject: `Ticket Created: ${ticket.ticketId} - ${ticket.subject}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b, #334155); border-radius: 16px; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #ec4899, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .ticket-id { background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: bold; }
          .content { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; }
          .field { margin-bottom: 16px; }
          .label { color: #94a3b8; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
          .value { color: #f1f5f9; font-size: 16px; }
          .status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status-todo { background: rgba(59,130,246,0.2); color: #60a5fa; }
          .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Tashkhees Support</div>
            <p style="color: #94a3b8;">Your ticket has been received</p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <span class="ticket-id">${ticket.ticketId}</span>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${ticket.subject}</div>
            </div>
            <div class="field">
              <div class="label">Product</div>
              <div class="value">${ticket.product}</div>
            </div>
            <div class="field">
              <div class="label">Status</div>
              <div class="value"><span class="status status-todo">TO DO</span></div>
            </div>
            <div class="field">
              <div class="label">Description</div>
              <div class="value" style="font-size: 14px;">${ticket.description}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>We'll notify you when there's an update on your ticket.</p>
            <p>© ${new Date().getFullYear()} Tashkhees Support Portal</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    statusChanged: (ticket, oldStatus, newStatus, changedBy) => ({
        subject: `Ticket ${ticket.ticketId} - Status Updated to ${newStatus}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b, #334155); border-radius: 16px; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #ec4899, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .ticket-id { background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: bold; }
          .content { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; }
          .status-change { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 24px 0; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
          .status-old { background: rgba(148,163,184,0.2); color: #94a3b8; text-decoration: line-through; }
          .status-new { background: rgba(34,197,94,0.2); color: #4ade80; }
          .arrow { color: #a855f7; font-size: 24px; }
          .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Tashkhees Support</div>
            <p style="color: #94a3b8;">Your ticket status has been updated</p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <span class="ticket-id">${ticket.ticketId}</span>
          </div>
          
          <div class="status-change">
            <span class="status status-old">${oldStatus}</span>
            <span class="arrow">→</span>
            <span class="status status-new">${newStatus}</span>
          </div>
          
          <div class="content">
            <div style="margin-bottom: 16px;">
              <div style="color: #94a3b8; font-size: 12px;">Subject</div>
              <div style="color: #f1f5f9; font-size: 16px;">${ticket.subject}</div>
            </div>
            ${changedBy ? `
            <div>
              <div style="color: #94a3b8; font-size: 12px;">Updated by</div>
              <div style="color: #f1f5f9; font-size: 16px;">${changedBy}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for using Tashkhees Support Portal.</p>
            <p>© ${new Date().getFullYear()} Tashkhees Support Portal</p>
          </div>
        </div>
      </body>
      </html>
    `
    }),

    ticketAssigned: (ticket, assignedTo) => ({
        subject: `Ticket ${ticket.ticketId} - Assigned to ${assignedTo}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b, #334155); border-radius: 16px; padding: 32px; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #ec4899, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .ticket-id { background: linear-gradient(135deg, #a855f7, #3b82f6); color: white; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: bold; }
          .content { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; }
          .highlight { background: rgba(168,85,247,0.2); color: #c084fc; padding: 12px 20px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: 600; }
          .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Tashkhees Support</div>
            <p style="color: #94a3b8;">Your ticket has been assigned</p>
          </div>
          
          <div style="text-align: center; margin: 24px 0;">
            <span class="ticket-id">${ticket.ticketId}</span>
          </div>
          
          <div class="highlight">
            🎯 Assigned to: ${assignedTo}
          </div>
          
          <div class="content">
            <div style="margin-bottom: 16px;">
              <div style="color: #94a3b8; font-size: 12px;">Subject</div>
              <div style="color: #f1f5f9; font-size: 16px;">${ticket.subject}</div>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">A developer is now working on your ticket. You'll be notified when there's an update.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Tashkhees Support Portal</p>
          </div>
        </div>
      </body>
      </html>
    `
    })
};

// Send email function
export const sendEmail = async (to, template, data) => {
    // Skip if email is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Email not configured, skipping email notification');
        return { success: false, error: 'Email not configured' };
    }

    try {
        const transporter = createTransporter();
        const emailContent = emailTemplates[template](data.ticket, data.oldStatus, data.newStatus, data.changedBy || data.assignedTo);

        const mailOptions = {
            from: process.env.EMAIL_FROM || `Tashkhees Support <${process.env.EMAIL_USER}>`,
            to: to,
            subject: emailContent.subject,
            html: emailContent.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return { success: false, error: error.message };
    }
};

export default { sendEmail };
