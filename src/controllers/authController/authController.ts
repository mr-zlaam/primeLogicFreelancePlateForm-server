import type { Request, Response } from "express";
import { httpResponse } from "../../utils/apiResponseUtils";
import type { TPAYLOAD, TSENDOTP, TUSERLOGIN, TUSERREGISTER, TUSERUPDATE, TVERIFYUSER } from "../../types";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { db } from "../../database/db";
import { ACESSTOKENCOOKIEOPTIONS, BADREQUESTCODE, REFRESHTOKENCOOKIEOPTIONS, SUCCESSCODE, UNAUTHORIZEDCODE, UNAUTHORIZEDMSG } from "../../constants";
import { passwordHasher, verifyPassword } from "../../services/passwordHasherService";
import tokenGeneratorService from "../../services/tokenGeneratorService";
import { generateOtp } from "../../services/slugStringGeneratorService";
import logger from "../../utils/loggerUtils";
import { verifyToken } from "../../services/verifyTokenService";
import { filterAdmin } from "../../utils/filterAdminUtils";
import emailResponses from "../../constants/emailResponses";
import { gloabalMailMessage } from "../../services/globalMailService";

let payLoad: TPAYLOAD = { uid: "", tokenVersion: 0, role: "CLIENT", isVerified: null };
export default {
  // ********* REGISTER USER *********
  registerUser: asyncHandler(async (req: Request, res: Response) => {
    // validation is already handled by the middleware
    const userData = req.body as TUSERREGISTER;
    const { username, fullName, email, password, country } = userData;
    const isUserExist = await db.user.findFirst({
      where: { OR: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] }
    });
    if (isUserExist) throw { status: BADREQUESTCODE, message: "user already exists with same username or email." };
    const hashedPassword = (await passwordHasher(password, res)) as string;
    const generateOneTimePassword = generateOtp();
    const hashedOTPPassword = (await passwordHasher(generateOneTimePassword.otp, res)) as string;

    const createdUser = await db.user.create({
      data: {
        username: username.toLowerCase(),
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: filterAdmin(email) ? "ADMIN" : "CLIENT",
        otpPassword: filterAdmin(email) ? null : hashedOTPPassword,
        otpPasswordExpiry: filterAdmin(email) ? null : generateOneTimePassword.otpExpiry,
        emailVerifiedAt: filterAdmin(email) ? new Date() : null,
        country
      }
    });
    if (!filterAdmin(email)) {
      await gloabalMailMessage(
        email,
        emailResponses.OTP_SENDER_MESSAGE(generateOneTimePassword.otp, "30m"),
        "Account Verification",
        `Dear ${fullName},`
      );
    }
    const isSubscribed = await db.newsletter.findUnique({ where: { email: email.toLowerCase() } });
    if (!filterAdmin(email) && isSubscribed?.email !== createdUser?.email) {
      // **     send otp
      await Promise.all([
        await gloabalMailMessage(
          email,
          emailResponses.OTP_SENDER_MESSAGE(generateOneTimePassword.otp, "30m"),
          "Account Verification",
          `Dear ${fullName},`
        ),
        // ** subscribe email for news letter
        await db.newsletter.create({
          data: {
            email: email.toLowerCase()
          }
        })
      ]);
    }

    const { generateAccessToken } = tokenGeneratorService;
    payLoad = { uid: createdUser.email, isVerified: null, tokenVersion: createdUser.tokenVersion, role: createdUser.role };
    const accessToken = generateAccessToken(payLoad, res);
    if (!filterAdmin(email)) {
      res.cookie("accessToken", accessToken, ACESSTOKENCOOKIEOPTIONS);
    }
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      filterAdmin(email) ? "User registered successfully" : "Please verify your email with 6 digit OTP sent to your email",
      { fullName, email, accessToken: !filterAdmin(email) ? accessToken : null }
    );
  }),

  // ********* LOGIN USER *********
  loginUser: asyncHandler(async (req: Request, res: Response) => {
    // validation is already handled by the middleware
    const { username, password } = req.body as TUSERLOGIN;

    const user = await db.user.findUnique({ where: { username: username } });
    if (!user) throw { status: BADREQUESTCODE, message: "Invalid credentials" };

    if (user.trashedBy) throw { status: BADREQUESTCODE, message: "You account has been suspended by Administrators. Please contact support" };
    if (!user.emailVerifiedAt) throw { status: BADREQUESTCODE, message: "Please verify your email first" };
    const isPasswordMatch = await verifyPassword(password, user?.password, res);
    if (!isPasswordMatch) throw { status: BADREQUESTCODE, message: "Invalid credentials" };
    const { generateAccessToken, generateRefreshToken } = tokenGeneratorService;
    payLoad = {
      uid: user?.uid,
      tokenVersion: user?.tokenVersion,
      role: !filterAdmin(user.email) ? user.role : "ADMIN",
      isVerified: user?.emailVerifiedAt
    };
    const accessToken = generateAccessToken(payLoad, res);
    const refreshToken = generateRefreshToken(payLoad, res);
    res.cookie("refreshToken", refreshToken, REFRESHTOKENCOOKIEOPTIONS).cookie("accessToken", accessToken, ACESSTOKENCOOKIEOPTIONS);
    httpResponse(req, res, SUCCESSCODE, "User logged in successfully", { uid: user.uid, username, refreshToken, accessToken });
  }),
  // ********* VERIFY USER WITH OTP ***************
  verifyUser: asyncHandler(async (req: Request, res: Response) => {
    // validation is already handled by the middleware
    const { OTP, email } = req.body as TVERIFYUSER;
    const user = await db.user.findUnique({ where: { email: email } });
    if (!user) throw { status: BADREQUESTCODE, message: "Invalid email" };

    if (user.otpPasswordExpiry && user.otpPasswordExpiry < new Date()) {
      await db.user.update({
        where: { email: email.toLowerCase() },
        data: {
          otpPassword: null,
          otpPasswordExpiry: null
        }
      });
      throw { status: BADREQUESTCODE, message: "OTP expired. Please try again" };
    }
    const isPasswordMatch = await verifyPassword(OTP, user?.otpPassword as string, res);
    if (!isPasswordMatch) throw { status: BADREQUESTCODE, message: "Invalid OTP" };
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: {
        emailVerifiedAt: new Date(),
        otpPassword: null,
        otpPasswordExpiry: null
      }
    });
    const { generateAccessToken, generateRefreshToken } = tokenGeneratorService;
    // test
    payLoad = {
      uid: user?.uid,
      tokenVersion: user?.tokenVersion,
      role: user.role === "FREELANCER" ? "FREELANCER" : filterAdmin(email) ? "ADMIN" : "CLIENT",
      isVerified: new Date()
    };
    const accessToken = generateAccessToken(payLoad, res);
    const refreshToken = generateRefreshToken(payLoad, res);
    res.cookie("refreshToken", refreshToken, REFRESHTOKENCOOKIEOPTIONS).cookie("accessToken", accessToken, ACESSTOKENCOOKIEOPTIONS);
    httpResponse(req, res, SUCCESSCODE, "User verified  successfully", { uid: user.uid, email: user.email, refreshToken, accessToken });
  }),
  // ********** Send OTP controller *******************
  sendOTP: asyncHandler(async (req: Request, res: Response) => {
    // validation is already handled by middleware
    const { email } = req.body as TSENDOTP;
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw { status: BADREQUESTCODE, message: "Invalid email" };
    if (user.emailVerifiedAt) throw { status: BADREQUESTCODE, message: "Email already verified" };
    const generateOneTimePassword = generateOtp();
    const hashedOTPPassword = (await passwordHasher(generateOneTimePassword.otp, res)) as string;
    await db.user.update({
      where: { email: email.toLowerCase() },
      data: {
        otpPassword: hashedOTPPassword,
        otpPasswordExpiry: generateOneTimePassword.otpExpiry
      }
    });
    await gloabalMailMessage(
      email,
      emailResponses.OTP_SENDER_MESSAGE(generateOneTimePassword.otp, "30m"),
      "Account Verification",
      `Dear ${user.fullName},`
    );
    httpResponse(req, res, SUCCESSCODE, "OTP sent successfully", { email });
  }),
  // *** Logout User Controlelr ************************* This controller is only for user who want to logout himself admin can't use this otherise he will logout himself
  logOut: (req: Request, res: Response) => {
    res.cookie("refreshToken", "", REFRESHTOKENCOOKIEOPTIONS);
    res.cookie("accessToken", "", ACESSTOKENCOOKIEOPTIONS);
    httpResponse(req, res, SUCCESSCODE, "User logged out successfully");
  },
  // ** This controller is only for dashboard Administrators
  logOutUserForecfully: asyncHandler(async (req: Request, res: Response) => {
    const { uid } = req.body as TUSERUPDATE;
    if (!uid) throw { status: BADREQUESTCODE, message: "Please Send user ID" };
    await db.user.update({
      where: { uid },
      data: {
        tokenVersion: { increment: 1 }
      }
    });
    res.cookie("refreshToken", "", REFRESHTOKENCOOKIEOPTIONS);
    res.cookie("accessToken", "", ACESSTOKENCOOKIEOPTIONS);
    httpResponse(req, res, SUCCESSCODE, "User logged out successfully");
  }),
  // ** RefreshedAccessToken
  refreshAcessToken: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.header("Authorization")?.split(" ")[1];

    if (!refreshToken) throw { status: BADREQUESTCODE, message: "Please provide refresh token" };

    const [error, decoded] = verifyToken<TPAYLOAD>(refreshToken);

    if (error) {
      logger.error("Error while verifying token", "authController.ts:152");
      throw { status: UNAUTHORIZEDCODE, message: UNAUTHORIZEDMSG };
    }

    if (!decoded?.uid) {
      logger.warn("Invalid token. Not uid found in accessToken", "authController.ts:158");
      throw { status: UNAUTHORIZEDCODE, message: UNAUTHORIZEDMSG };
    }

    const user = await db.user.findUnique({ where: { uid: decoded.uid } });

    if (!user) {
      logger.warn("Invalid token. User not found", "authController.ts:164");
      throw { status: UNAUTHORIZEDCODE, message: UNAUTHORIZEDMSG };
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      logger.error("Invalid token. tokenVersion doesn't match maybe session is expired", "authController.ts:169");
      throw { status: UNAUTHORIZEDCODE, message: "Session expired. Please login again" };
    }

    const { generateAccessToken } = tokenGeneratorService;
    const payLoad: TPAYLOAD = {
      uid: user && user?.uid,
      tokenVersion: user?.tokenVersion,
      role: filterAdmin(user?.email) ? "ADMIN" : "CLIENT",
      isVerified: user?.emailVerifiedAt
    };
    const accessToken = generateAccessToken(payLoad, res);

    res.cookie("accessToken", accessToken, ACESSTOKENCOOKIEOPTIONS);

    httpResponse(req, res, SUCCESSCODE, "Token refreshed successfully", { accessToken });
  })
};
