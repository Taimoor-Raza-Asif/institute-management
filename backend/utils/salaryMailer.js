// // backend/utils/salaryMailer.js
// import nodemailer from 'nodemailer';
// import { jsPDF } from 'jspdf';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import dns from 'dns';

// // Force Node.js to prefer IPv4 over IPv6. 
// // This fixes the 'connect ENETUNREACH 2607...' error on Render where IPv6 is not supported.
// dns.setDefaultResultOrder('ipv4first');

// const __filename = fileURLToPath(import.meta.url);
// const __dirname  = path.dirname(__filename);

// // Resolve logo once at module level — path: backend/utils/ -> ../../frontend/public/
// const LOGO_PATH = path.join(__dirname, '..', '..', 'frontend', 'public', 'Jamia Logo.png');
// let LOGO_BASE64 = null;
// try {
//   if (fs.existsSync(LOGO_PATH)) {
//     LOGO_BASE64 = 'data:image/png;base64,' + fs.readFileSync(LOGO_PATH).toString('base64');
//   }
// } catch (_) { /* logo not found — skip gracefully */ }

// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December'
// ];

// /**
//  * Generates a minimal salary slip PDF as a Buffer (no logo, server-side safe).
//  */
// function generateSalarySlipPDF(salary) {
//   const doc = new jsPDF({ format: 'a4' });
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();
//   const margin = 15;
//   let yPos = 0;

//   // ── Header ─────────────────────────────────────────────
//   const headerHeight = 46;
//   doc.setFillColor(15, 118, 110);
//   doc.rect(0, 0, pageWidth, headerHeight, 'F');

//   doc.setFillColor(20, 184, 166);
//   doc.triangle(pageWidth * 0.45, 0, pageWidth, 0, pageWidth, headerHeight, 'F');

//   doc.setFillColor(255, 255, 255);
//   doc.setGState(new doc.GState({ opacity: 0.06 }));
//   doc.circle(pageWidth * 0.75, -8, 42, 'F');
//   doc.circle(pageWidth * 0.92, headerHeight + 4, 30, 'F');
//   doc.setGState(new doc.GState({ opacity: 1 }));

//   doc.setFillColor(8, 145, 178);
//   doc.rect(0, headerHeight - 3.5, pageWidth, 3.5, 'F');

//   // Logo circle
//   doc.setFillColor(255, 255, 255);
//   doc.circle(margin + 14, 23, 15, 'F');
//   doc.setDrawColor(8, 145, 178);
//   doc.setLineWidth(1.2);
//   doc.circle(margin + 14, 23, 15.8, 'S');
//   if (LOGO_BASE64) {
//     doc.addImage(LOGO_BASE64, 'PNG', margin + 4, 13, 20, 20);
//   }

//   // Institute name
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(18);
//   doc.setFont(undefined, 'bold');
//   doc.text('Jamia Tul Mastwaar', margin + 34, 18);
//   doc.setFontSize(8);
//   doc.setFont(undefined, 'normal');
//   doc.setTextColor(204, 251, 241);
//   doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 34, 25);
//   doc.text('(0334) 8724125  |  jamiatulmastwaar@gmail.com', margin + 34, 31);

//   // Badge
//   const badgeW = 46, badgeH = 11;
//   const badgeX = pageWidth - margin - badgeW, badgeY = 30;
//   doc.setFillColor(255, 255, 255);
//   doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'F');
//   doc.setDrawColor(15, 118, 110);
//   doc.setLineWidth(0.8);
//   doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'S');
//   doc.setFontSize(8.5);
//   doc.setFont(undefined, 'bold');
//   doc.setTextColor(15, 118, 110);
//   doc.text('SALARY SLIP', badgeX + badgeW / 2, badgeY + 7.2, { align: 'center' });

//   yPos = headerHeight + 8;
//   doc.setTextColor(0, 0, 0);

//   // Timestamp strip
//   doc.setFillColor(236, 253, 245);
//   doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
//   doc.setFontSize(8);
//   doc.setTextColor(4, 120, 87);
//   doc.text(`Generated on: ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`, margin + 3, yPos + 6);
//   doc.setTextColor(0, 0, 0);
//   yPos += 14;

//   // ── Helpers ──────────────────────────────────────────────
//   const drawSectionHeader = (title) => {
//     doc.setFillColor(15, 118, 110);
//     doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
//     doc.setFontSize(9);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(255, 255, 255);
//     doc.text(title, margin + 4, yPos + 6.2);
//     doc.setTextColor(0, 0, 0);
//     yPos += 13;
//   };

//   const cellW = (pageWidth - 2 * margin) / 2;
//   const cellH = 11;
//   const drawInfoCell = (x, label, value, shade) => {
//     if (shade) { doc.setFillColor(240, 253, 250); doc.rect(x, yPos, cellW, cellH, 'F'); }
//     doc.setDrawColor(210, 235, 230);
//     doc.setLineWidth(0.2);
//     doc.rect(x, yPos, cellW, cellH, 'S');
//     doc.setFontSize(7.5);
//     doc.setFont(undefined, 'bold');
//     doc.setTextColor(80, 100, 95);
//     doc.text(label, x + 3, yPos + 4.5);
//     doc.setFontSize(8.5);
//     doc.setFont(undefined, 'normal');
//     doc.setTextColor(20, 20, 20);
//     doc.text(value ? String(value) : 'N/A', x + 3, yPos + 9);
//   };
//   const drawInfoRow = (label1, val1, label2, val2) => {
//     drawInfoCell(margin, label1, val1, false);
//     drawInfoCell(margin + cellW, label2, val2, true);
//     yPos += cellH;
//   };

//   // ── STAFF INFORMATION ──
//   drawSectionHeader('STAFF INFORMATION');
//   drawInfoRow('Full Name', salary.staffName, 'CNIC', salary.staffCnic);
//   drawInfoRow('Role / Position', salary.staffRole, 'Salary / Month', `PKR ${parseFloat(salary.salaryPerMonth).toLocaleString()}`);
//   drawInfoRow('Date of Joining', salary.staffJoiningDate ? new Date(salary.staffJoiningDate).toLocaleDateString() : 'N/A', '', '');
//   yPos += 6;

//   // ── SALARY DETAILS ──
//   drawSectionHeader('SALARY DETAILS');
//   drawInfoRow('Bonus', `PKR ${parseFloat(salary.bonus || 0).toLocaleString()}`, 'Overtime', `PKR ${parseFloat(salary.overtime || 0).toLocaleString()}`);
//   drawInfoRow('Advanced Salary', `PKR ${parseFloat(salary.advancedSalary || 0).toLocaleString()}`, 'Deduction', `PKR ${parseFloat(salary.deduction || 0).toLocaleString()}`);
//   yPos += 6;

//   // ── PAYMENT INFORMATION ──
//   drawSectionHeader('PAYMENT INFORMATION');
//   drawInfoRow('Status', salary.status, 'Payment Method', salary.paidAs);
//   drawInfoRow(`Month / Year`, `${MONTHS[salary.month - 1]} ${salary.year}`, 'Paid By', salary.paidByName || 'N/A');
//   drawInfoRow('Paid At', new Date(salary.paidAt).toLocaleDateString(), '', '');
//   yPos += 8;

//   // ── NET PAID card ──
//   const cardH = 22;
//   doc.setFillColor(15, 118, 110);
//   doc.roundedRect(margin, yPos, pageWidth - 2 * margin, cardH, 3, 3, 'F');
//   doc.setFillColor(20, 184, 166);
//   doc.setGState(new doc.GState({ opacity: 0.35 }));
//   doc.roundedRect(margin + (pageWidth - 2 * margin) * 0.55, yPos, (pageWidth - 2 * margin) * 0.45, cardH, 3, 3, 'F');
//   doc.setGState(new doc.GState({ opacity: 1 }));
//   doc.setFontSize(8); doc.setFont(undefined, 'normal');
//   doc.setTextColor(204, 251, 241);
//   doc.text('NET AMOUNT PAID', margin + 5, yPos + 8);
//   doc.setFontSize(13); doc.setFont(undefined, 'bold');
//   doc.setTextColor(255, 255, 255);
//   doc.text(`PKR ${parseFloat(salary.paidAmount).toLocaleString()}`, margin + 5, yPos + 17);
//   doc.setFontSize(7); doc.setFont(undefined, 'normal');
//   doc.setTextColor(153, 246, 228);
//   doc.text('Salary Slip', pageWidth - margin - 5, yPos + 13, { align: 'right' });
//   yPos += cardH + 12;

//   // ── Footer ──
//   doc.setFontSize(7);
//   doc.setTextColor(150);
//   doc.text('This is a computer-generated salary slip. No signature is required.', pageWidth / 2, yPos, { align: 'center' });

//   const footerY = pageHeight - 10;
//   doc.setDrawColor(200, 200, 200);
//   doc.setLineWidth(0.3);
//   doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
//   doc.setFontSize(7);
//   doc.setTextColor(120);
//   doc.text('Jamia Tul Mastwaar - Salary Slip', margin, footerY);
//   doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

//   // Return as Buffer
//   const arrayBuffer = doc.output('arraybuffer');
//   return Buffer.from(arrayBuffer);
// }

// /**
//  * Sends a salary slip email to the staff member.
//  * @param {Object} salary - Full salary document
//  * @param {string} staffEmail - Recipient email address
//  * @param {'new'|'update'} type - Whether this is a new record or an update
//  */
// export async function sendSalarySlipEmail(salary, staffEmail, type = 'new') {
//   if (!staffEmail) return; // No email on file — skip silently

//   const monthYear = `${MONTHS[salary.month - 1]} ${salary.year}`;
//   const isUpdate = type === 'update';

//   // Build the PDF buffer
//   const pdfBuffer = generateSalarySlipPDF(salary);

//   // Resolve smtp.gmail.com to an IPv4 address manually to bypass Render's IPv6 ENETUNREACH
//   const lookupResult = await dns.promises.lookup('smtp.gmail.com', { family: 4 });
//   const ipv4Host = lookupResult.address;

//   // Create transporter using the explicit IPv4 address
//   const transporter = nodemailer.createTransport({
//     host: ipv4Host,
//     port: 465,
//     secure: true,
//     auth: {
//       user: process.env.PAYROLL_EMAIL,
//       pass: process.env.PAYROLL_EMAIL_PASS,
//     },
//     tls: {
//       // Must match the original hostname for SSL/TLS certificate validation
//       servername: 'smtp.gmail.com'
//     }
//   });

//   // ── Subject & plain-text body ──────────────────────────────────────
//   const subject = isUpdate
//     ? `Salary Slip Updated — ${monthYear} | Jamia Tul Mastwaar`
//     : `Salary Slip — ${monthYear} | Jamia Tul Mastwaar`;

//   const plainText = isUpdate
//     ? `Assalam-u-Alaikum ${salary.staffName},

// We would like to inform you that your salary details for the month of ${monthYear} have been updated.

// Please find the revised salary slip attached to this email. Kindly review the updated details carefully.

// In case of any query or correction, feel free to contact the administration office.

// Regards,
// Accounts Department
// Jamia Tul Mastwaar
// +923195000255`
//     : `Assalam-u-Alaikum ${salary.staffName},

// Please find attached your salary slip for the month of ${monthYear}.

// Kindly review the details. In case of any query or correction, feel free to contact the administration office.

// Regards,
// Accounts Department
// Jamia Tul Mastwaar
// +923195000255`;

//   // ── HTML body ──────────────────────────────────────────────────────
//   const headerGradient = isUpdate
//     ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'   // blue for update
//     : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)';  // teal for new

//   const badgeColor   = isUpdate ? '#1d4ed8' : '#0f766e';
//   const badgeBg      = isUpdate ? '#eff6ff' : '#f0fdf4';
//   const badgeBorder  = isUpdate ? '#bfdbfe' : '#bbf7d0';
//   const amountColor  = isUpdate ? '#1d4ed8' : '#0f766e';

//   const headerTitle  = isUpdate ? 'Salary Slip — Updated' : 'Salary Slip';
//   const intro = isUpdate
//     ? `We would like to inform you that your salary details for the month of <strong>${monthYear}</strong> have been <strong style="color:${badgeColor}">updated</strong>. Please find the revised salary slip attached.`
//     : `Please find attached your salary slip for the month of <strong>${monthYear}</strong>.`;

//   const htmlBody = `
// <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
//   <!-- Header -->
//   <div style="background: ${headerGradient}; padding: 28px 32px;">
//     <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">${headerTitle}</h1>
//     <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Jamia Tul Mastwaar &nbsp;|&nbsp; Makhdoom Pur Sharif Murid, Chakwal</p>
//   </div>
//   <!-- Body -->
//   <div style="padding: 28px 32px; background: #ffffff;">
//     <p style="font-size: 15px; color: #111827; margin: 0 0 16px;">Assalam-u-Alaikum <strong>${salary.staffName}</strong>,</p>
//     <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 24px;">${intro}</p>
//     <!-- Summary card -->
//     <div style="background: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
//       <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
//         <tr>
//           <td style="padding: 4px 0; font-weight: 600; color: #6b7280; width: 50%;">Month / Year</td>
//           <td style="padding: 4px 0;">${monthYear}</td>
//         </tr>
//         <tr>
//           <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Status</td>
//           <td style="padding: 4px 0;">${salary.status}</td>
//         </tr>
//         <tr>
//           <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Net Paid</td>
//           <td style="padding: 4px 0; font-weight: 700; color: ${amountColor};">PKR ${parseFloat(salary.paidAmount).toLocaleString()}</td>
//         </tr>
//       </table>
//     </div>
//     <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 24px;">
//       Kindly review the details. In case of any query or correction, feel free to contact the administration office.
//     </p>
//     <p style="font-size: 13px; color: #9ca3af; margin: 0;">This is an automated email. Please do not reply directly to this message.</p>
//   </div>
//   <!-- Footer -->
//   <div style="background: #f3f4f6; padding: 18px 32px; border-top: 1px solid #e5e7eb;">
//     <p style="margin: 0; font-size: 13px; color: #374151; font-weight: 600;">Accounts Department</p>
//     <p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Jamia Tul Mastwaar &nbsp;|&nbsp; +923195000255</p>
//   </div>
// </div>`;

//   const mailOptions = {
//     from: `"Accounts Department - Jamia Tul Mastwaar" <${process.env.PAYROLL_EMAIL}>`,
//     to: staffEmail,
//     subject,
//     text: plainText,
//     html: htmlBody,
//     attachments: [
//       {
//         filename: `${salary.staffName.replace(/\s/g, '_')}_Salary_Slip_${MONTHS[salary.month - 1]}_${salary.year}.pdf`,
//         content: pdfBuffer,
//         contentType: 'application/pdf',
//       },
//     ],
//   };

//   await transporter.sendMail(mailOptions);
//   console.log(`✅ Salary slip email (${type}) sent to ${staffEmail} for ${salary.staffName}`);
// }














// backend/utils/salaryMailer.js
import { Resend } from 'resend';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve logo once at module level — path: backend/utils/ -> ../../frontend/public/
const LOGO_PATH = path.join(__dirname, '..', '..', 'frontend', 'public', 'Jamia Logo.png');
let LOGO_BASE64 = null;
try {
  if (fs.existsSync(LOGO_PATH)) {
    LOGO_BASE64 = 'data:image/png;base64,' + fs.readFileSync(LOGO_PATH).toString('base64');
  }
} catch (_) { /* logo not found — skip gracefully */ }

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Generates a salary slip PDF and returns it as a Buffer.
 */
function generateSalarySlipPDF(salary) {
  const doc = new jsPDF({ format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = 0;

  // ── Header ─────────────────────────────────────────────
  const headerHeight = 46;
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  doc.setFillColor(20, 184, 166);
  doc.triangle(pageWidth * 0.45, 0, pageWidth, 0, pageWidth, headerHeight, 'F');

  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.06 }));
  doc.circle(pageWidth * 0.75, -8, 42, 'F');
  doc.circle(pageWidth * 0.92, headerHeight + 4, 30, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setFillColor(8, 145, 178);
  doc.rect(0, headerHeight - 3.5, pageWidth, 3.5, 'F');

  // Logo circle
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 14, 23, 15, 'F');
  doc.setDrawColor(8, 145, 178);
  doc.setLineWidth(1.2);
  doc.circle(margin + 14, 23, 15.8, 'S');
  if (LOGO_BASE64) {
    doc.addImage(LOGO_BASE64, 'PNG', margin + 4, 13, 20, 20);
  }

  // Institute name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Jamia Tul Mastwaar', margin + 34, 18);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(204, 251, 241);
  doc.text('Makhdoom Pur Sharif Murid, Chakwal', margin + 34, 25);
  doc.text('(0334) 8724125  |  jamiatulmastwaar@gmail.com', margin + 34, 31);

  // Badge
  const badgeW = 46, badgeH = 11;
  const badgeX = pageWidth - margin - badgeW, badgeY = 30;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'F');
  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(0.8);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, 'S');
  doc.setFontSize(8.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('SALARY SLIP', badgeX + badgeW / 2, badgeY + 7.2, { align: 'center' });

  yPos = headerHeight + 8;
  doc.setTextColor(0, 0, 0);

  // Timestamp strip
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}`, margin + 3, yPos + 6);
  doc.setTextColor(0, 0, 0);
  yPos += 14;

  // ── Helpers ──────────────────────────────────────────────
  const drawSectionHeader = (title) => {
    doc.setFillColor(15, 118, 110);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 9, 1.5, 1.5, 'F');
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 4, yPos + 6.2);
    doc.setTextColor(0, 0, 0);
    yPos += 13;
  };

  const cellW = (pageWidth - 2 * margin) / 2;
  const cellH = 11;
  const drawInfoCell = (x, label, value, shade) => {
    if (shade) { doc.setFillColor(240, 253, 250); doc.rect(x, yPos, cellW, cellH, 'F'); }
    doc.setDrawColor(210, 235, 230);
    doc.setLineWidth(0.2);
    doc.rect(x, yPos, cellW, cellH, 'S');
    doc.setFontSize(7.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(80, 100, 95);
    doc.text(label, x + 3, yPos + 4.5);
    doc.setFontSize(8.5);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(value ? String(value) : 'N/A', x + 3, yPos + 9);
  };
  const drawInfoRow = (label1, val1, label2, val2) => {
    drawInfoCell(margin, label1, val1, false);
    drawInfoCell(margin + cellW, label2, val2, true);
    yPos += cellH;
  };

  // ── STAFF INFORMATION ──
  drawSectionHeader('STAFF INFORMATION');
  drawInfoRow('Full Name', salary.staffName, 'CNIC', salary.staffCnic);
  drawInfoRow('Role / Position', salary.staffRole, 'Salary / Month', `PKR ${parseFloat(salary.salaryPerMonth).toLocaleString()}`);
  drawInfoRow('Date of Joining', salary.staffJoiningDate ? new Date(salary.staffJoiningDate).toLocaleDateString() : 'N/A', '', '');
  yPos += 6;

  // ── SALARY DETAILS ──
  drawSectionHeader('SALARY DETAILS');
  drawInfoRow('Bonus', `PKR ${parseFloat(salary.bonus || 0).toLocaleString()}`, 'Overtime', `PKR ${parseFloat(salary.overtime || 0).toLocaleString()}`);
  drawInfoRow('Advanced Salary', `PKR ${parseFloat(salary.advancedSalary || 0).toLocaleString()}`, 'Deduction', `PKR ${parseFloat(salary.deduction || 0).toLocaleString()}`);
  yPos += 6;

  // ── PAYMENT INFORMATION ──
  drawSectionHeader('PAYMENT INFORMATION');
  drawInfoRow('Status', salary.status, 'Payment Method', salary.paidAs);
  drawInfoRow(`Month / Year`, `${MONTHS[salary.month - 1]} ${salary.year}`, 'Paid By', salary.paidByName || 'N/A');
  drawInfoRow('Paid At', new Date(salary.paidAt).toLocaleDateString(), '', '');
  yPos += 8;

  // ── NET PAID card ──
  const cardH = 22;
  doc.setFillColor(15, 118, 110);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, cardH, 3, 3, 'F');
  doc.setFillColor(20, 184, 166);
  doc.setGState(new doc.GState({ opacity: 0.35 }));
  doc.roundedRect(margin + (pageWidth - 2 * margin) * 0.55, yPos, (pageWidth - 2 * margin) * 0.45, cardH, 3, 3, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.setFontSize(8); doc.setFont(undefined, 'normal');
  doc.setTextColor(204, 251, 241);
  doc.text('NET AMOUNT PAID', margin + 5, yPos + 8);
  doc.setFontSize(13); doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`PKR ${parseFloat(salary.paidAmount).toLocaleString()}`, margin + 5, yPos + 17);
  doc.setFontSize(7); doc.setFont(undefined, 'normal');
  doc.setTextColor(153, 246, 228);
  doc.text('Salary Slip', pageWidth - margin - 5, yPos + 13, { align: 'right' });
  yPos += cardH + 12;

  // ── Footer ──
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('This is a computer-generated salary slip. No signature is required.', pageWidth / 2, yPos, { align: 'center' });

  const footerY = pageHeight - 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Jamia Tul Mastwaar - Salary Slip', margin, footerY);
  doc.text('Page 1 of 1', pageWidth - margin, footerY, { align: 'right' });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}

/**
 * Sends a salary slip email via Resend (HTTPS API — works on all hosting platforms).
 * @param {Object} salary     - Full salary document
 * @param {string} staffEmail - Recipient email address
 * @param {'new'|'update'} type - Whether this is a new record or an update
 */
export async function sendSalarySlipEmail(salary, staffEmail, type = 'new') {
  if (!staffEmail) return; // No email on file — skip silently

  // ── Resend client (uses HTTPS port 443, no SMTP ports needed) ─────
  const resend = new Resend(process.env.RESEND_API_KEY);

  const monthYear = `${MONTHS[salary.month - 1]} ${salary.year}`;
  const isUpdate  = type === 'update';

  // Build the PDF buffer
  const pdfBuffer = generateSalarySlipPDF(salary);

  // ── Subject ────────────────────────────────────────────────────────
  const subject = isUpdate
    ? `Salary Slip Updated — ${monthYear} | Jamia Tul Mastwaar`
    : `Salary Slip — ${monthYear} | Jamia Tul Mastwaar`;

  // ── Plain-text fallback ────────────────────────────────────────────
  const plainText = isUpdate
    ? `Assalam-u-Alaikum ${salary.staffName},

We would like to inform you that your salary details for the month of ${monthYear} have been updated.

Please find the revised salary slip attached to this email. Kindly review the updated details carefully.

In case of any query or correction, feel free to contact the administration office.

Regards,
Accounts Department
Jamia Tul Mastwaar
+923195000255`
    : `Assalam-u-Alaikum ${salary.staffName},

Please find attached your salary slip for the month of ${monthYear}.

Kindly review the details. In case of any query or correction, feel free to contact the administration office.

Regards,
Accounts Department
Jamia Tul Mastwaar
+923195000255`;

  // ── HTML body ──────────────────────────────────────────────────────
  const headerGradient = isUpdate
    ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
    : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)';

  const badgeColor  = isUpdate ? '#1d4ed8' : '#0f766e';
  const badgeBg     = isUpdate ? '#eff6ff' : '#f0fdf4';
  const badgeBorder = isUpdate ? '#bfdbfe' : '#bbf7d0';
  const amountColor = isUpdate ? '#1d4ed8' : '#0f766e';
  const headerTitle = isUpdate ? 'Salary Slip — Updated' : 'Salary Slip';

  const intro = isUpdate
    ? `We would like to inform you that your salary details for the month of <strong>${monthYear}</strong> have been <strong style="color:${badgeColor}">updated</strong>. Please find the revised salary slip attached.`
    : `Please find attached your salary slip for the month of <strong>${monthYear}</strong>.`;

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
  <!-- Header -->
  <div style="background: ${headerGradient}; padding: 28px 32px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">${headerTitle}</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Jamia Tul Mastwaar &nbsp;|&nbsp; Makhdoom Pur Sharif Murid, Chakwal</p>
  </div>
  <!-- Body -->
  <div style="padding: 28px 32px; background: #ffffff;">
    <p style="font-size: 15px; color: #111827; margin: 0 0 16px;">Assalam-u-Alaikum <strong>${salary.staffName}</strong>,</p>
    <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 24px;">${intro}</p>
    <!-- Summary card -->
    <div style="background: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #6b7280; width: 50%;">Month / Year</td>
          <td style="padding: 4px 0;">${monthYear}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Status</td>
          <td style="padding: 4px 0;">${salary.status}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: 600; color: #6b7280;">Net Paid</td>
          <td style="padding: 4px 0; font-weight: 700; color: ${amountColor};">PKR ${parseFloat(salary.paidAmount).toLocaleString()}</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 14px; color: #374151; line-height: 1.7; margin: 0 0 24px;">
      Kindly review the details. In case of any query or correction, feel free to contact the administration office.
    </p>
    <p style="font-size: 13px; color: #9ca3af; margin: 0;">This is an automated email. Please do not reply directly to this message.</p>
  </div>
  <!-- Footer -->
  <div style="background: #f3f4f6; padding: 18px 32px; border-top: 1px solid #e5e7eb;">
    <p style="margin: 0; font-size: 13px; color: #374151; font-weight: 600;">Accounts Department</p>
    <p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Jamia Tul Mastwaar &nbsp;|&nbsp; +923195000255</p>
  </div>
</div>`;

  // ── Send via Resend HTTPS API ──────────────────────────────────────
  //
  // FROM ADDRESS NOTE:
  //   • Free plan (no custom domain): use 'onboarding@resend.dev' — works immediately.
  //   • After verifying your own domain in Resend dashboard you can change this to
  //     something like: 'Accounts Department <accounts@jamiatulmastwaar.com>'
  //
  const pdfFilename = `${salary.staffName.replace(/\s/g, '_')}_Salary_Slip_${MONTHS[salary.month - 1]}_${salary.year}.pdf`;

  const { data, error } = await resend.emails.send({
    from: 'Accounts Department - Jamia Tul Mastwaar <onboarding@resend.dev>',
    to: staffEmail,
    subject,
    text: plainText,
    html: htmlBody,
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer.toString('base64'), // Resend expects base64 string
      },
    ],
  });

  if (error) {
    // Throw so the caller's catch block logs it exactly as before
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  console.log(`✅ Salary slip email (${type}) sent via Resend [id: ${data.id}] to ${staffEmail} for ${salary.staffName}`);
}