import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import _ from 'lodash';

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

const send = async (transporter, mail) => {
  const info = await transporter.sendMail(mail);
  console.log('Message sent: %s', info.messageId);
};

const init = () => {
  dotenv.config();
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: parseInt(process.env.PORT, 10),
    secure: true,
    auth: {
      user: process.env.SENDER,
      pass: process.env.PASS,
    },
  });

  // const transporter = nodemailer.createTransport({
  //   host: 'smtp.ethereal.email',
  //   port: 587,
  //   auth: {
  //     user: 'macie.haag93@ethereal.email',
  //     pass: '2YRDbGRwvf56MjXFvu',
  //   },
  // });

  const mail = _.shuffle(JSON.parse(readFileSync('./mocks/data.json')).map((obj) => {
    const content = readFileSync(obj.contentPath, 'utf-8');
    const data = {
      from: process.env.SENDER,
      to: process.env.RECEIVER,
      subject: obj.subject,
      html: content,
    };
    if (obj.filename) {
      return {
        ...data,
        attachments: [
          {
            filename: obj.filename,
            path: obj.filepath,
          },
        ],
      };
    }
    return data;
  }));

  const run = async () => {
    for (let i = 0; i < mail.length; i += 1) {
      send(transporter, mail[i]).catch(console.error);
      // eslint-disable-next-line no-await-in-loop
      await timer(300000);
    }
  };

  run();
};

init();
