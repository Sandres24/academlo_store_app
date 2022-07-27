require('dotenv').config({ path: './config.env' });
const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { htmlToText } = require('html-to-text');

class Email {
  constructor(to) {
    this.to = to;
  }

  // Connect to mail service
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Connect to SendGrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  // Send the actual mail
  async send(template, subject, mailData) {
    const html = pug.renderFile(path.join(__dirname, `../views/emails/${template}.pug`), mailData);

    await this.newTransport().sendMail({
      from: process.env.MAIL_FROM,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  async sendWellcome(name) {
    await this.send('wellcome', 'Wellcome to Academlo Store!', { name });
  }

  async sendPurchase(name, products, totalPrice) {
    await this.send('purchase', 'Check out your recently order', { name, products, totalPrice });
  }
}

module.exports = { Email };
