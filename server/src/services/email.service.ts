import { Resend } from "resend";

interface WelcomeEmailOptions {
  email: string;
  name: string;
}

const getEmailClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY environment variable is not set"
    );
  }

  return new Resend(apiKey);
};

const getSender = () => {
  const sender = process.env.EMAIL_FROM;

  if (!sender) {
    throw new Error(
      "EMAIL_FROM environment variable is not set"
    );
  }

  return sender;
};

export const sendWelcomeEmail = async ({
  email,
  name,
}: WelcomeEmailOptions) => {
  const resend = getEmailClient();

  const { data, error } = await resend.emails.send({
    from: getSender(),
    to: email,
    subject: "Welcome to TaskFlow-AI",
    text: `Welcome to TaskFlow-AI, ${name}!

Your account has been created successfully.

You can now create, organize, and manage your tasks.`,
  });

  if (error) {
    throw new Error(
      `Failed to send welcome email: ${error.message}`
    );
  }

  return data;
};