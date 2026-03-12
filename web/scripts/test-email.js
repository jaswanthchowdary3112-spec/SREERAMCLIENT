require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function testEmail() {
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('Using EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'NOT SET');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Environment variables missing!');
      return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Test System" <${process.env.EMAIL_USER}>`,
      to: 'jaswanthvellanki11@gmail.com',
      subject: 'Test Email from StockTrack',
      text: 'If you receive this, your SMTP settings are working correctly.',
      html: '<b>If you receive this, your SMTP settings are working correctly.</b>',
    });
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmail();
