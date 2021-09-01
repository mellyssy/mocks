/* eslint-disable no-await-in-loop */
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

  const mail = _.shuffle(JSON.parse(readFileSync('./mocks/beginners-data.json')).map((obj) => {
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
    for (let i = 1; i < mail.length; i += 1) {
      send(transporter, mail[i]).catch(console.error);
      console.log(new Date());
      await timer(900000);
    }
  };

  run();
};

init();
