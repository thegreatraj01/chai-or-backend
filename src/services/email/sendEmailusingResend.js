import { Resend } from 'resend';
import welcomeMessage from '../emailTemplate/welcomeTemplate.js';
import verifyEmail from '../emailTemplate/VerifyEmialTemplate.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const userWelcomeTemplate = welcomeMessage(); // pass username as a parameter 
const verifyEmailTemplate = verifyEmail() // pass username and otp as a parameter 


export const sendEamil = async () => {
  const { data, error } = await resend.emails.send({
    from: 'Raj <delivered@resend.dev>',
    to: ['thegreatraj0810@gmail.com'],
    subject: 'Hello World',
    html: verifyEmailTemplate,
  });
  console.log(data);
  if (error) {
    return console.error({ error });
  }
};
