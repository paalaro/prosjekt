import { userService, eventService } from './services';

class MailService {
  sendMail(recieverAdress, mailSubject, mailText) {
    let nodemailer = require('nodemailer');

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'gruppe8passord@gmail.com',
            pass: '0O1nNGBm'
        }
    });

    let mailOptions = {
        from: '"Gruppe 8" <gruppe8passord@gmail.com>',
        to: recieverAdress,
        subject: mailSubject,
        text: mailText
    };

    transporter.sendMail(mailOptions, function(error,info) {
      if (error) {
        return console.log(error);
      }
      else {
        console.log('Message sent: %s', info.messageId);
      }
    });
  }
}

let mailService = new MailService();

export { mailService };
