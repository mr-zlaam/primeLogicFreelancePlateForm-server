import nodemailer from "nodemailer";
import fs from "node:fs";
import path from "node:path";
import { HOST_EMAIL, HOST_EMAIL_SECRET } from "../config/config";
import { generateRandomStrings } from "./slugStringGeneratorService";
import logger from "../utils/loggerUtils";
import { INTERNALSERVERERRORCODE } from "../constants";

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: HOST_EMAIL,
    pass: HOST_EMAIL_SECRET // Use the app password if 2FA is enabled
  }
});

// Send OTP function
export async function sendOTP(to: string, otp: string, name: string, message?: string, subject?: string) {
  const templatePath = path.resolve(__dirname, "../templates/sendOTP.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf8");
  htmlTemplate = htmlTemplate
    .replace("{{otp}}", otp)
    .replace("{{name}}", name)
    .replace("{{message}}", message || "");
  const randomStr = generateRandomStrings(10);
  const mailOptions = {
    from: "noreply@pls.com",
    to: to,
    subject: subject ?? "Account Verification For Prime Logic Solution",
    html: htmlTemplate,
    headers: {
      "Message-ID": `<${randomStr}.dev>`
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info("OTP sent: " + info.response);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error sending OTP:${error.message}`);
      throw { status: INTERNALSERVERERRORCODE, message: "Unable To send OTP as something went wrong maybe" };
    } else {
      logger.error(`Error sending OTP:${error as string}`);

      throw { status: INTERNALSERVERERRORCODE, message: "Unable To send OTP due to server issue" };
    }
  }
}
