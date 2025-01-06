import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendScheduleRequestEmail = async (email, link) => {
  const template = localStorage.getItem('emailTemplate') || 
    `Please complete your work schedule using the following link: ${link}`;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Work Schedule Request',
    text: template.replace('{{link}}', link),
    html: template.replace('{{link}}', `<a href="${link}">Click here</a>`),
  };

  await sgMail.send(msg);
};