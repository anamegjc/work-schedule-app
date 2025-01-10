import sgMail from '@sendgrid/mail';

// Ensure API key is set
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in the environment variables');
}

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Default email template
const DEFAULT_TEMPLATE = 'Please complete your work schedule using the following link: {{link}}';

export const sendScheduleRequestEmail = async (email: string, link: string, customTemplate?: string) => {
  // Use custom template if provided, otherwise use default
  const template = customTemplate || DEFAULT_TEMPLATE;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'default@example.com', // Fallback email
    subject: 'Work Schedule Request',
    text: template.replace('{{link}}', link),
    html: template.replace('{{link}}', `<a href="${link}">Click here to complete your schedule</a>`),
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email to ${email}`);
  }
};

// Optional: Add a function to validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};