// Single line types
export type TENV = "DEVELOPMENT" | "PRODUCTION";

export type TROLE = "CLIENT" | "ADMIN" | "FREELANCER";
export type TPAYLOAD = {
  uid: string;
  tokenVersion: number;
  role: TROLE;
  isVerified: Date | null;
};
// Multiline types
export type httpResponseType = {
  success: boolean;
  status: number;
  message: string;
  data: unknown;
  requestInfo: {
    ip?: string | null;
    url: string | null;
    method: string | null;
  };
};

export type TUSERREGISTER = {
  uid?: string;
  username: string;
  fullName: string;
  email: string;
  password: string;

  role: TROLE;
  otpPassword?: string | null;
  otpExpiry?: Date | null;
  emailVerifiedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

export type TUSERUPDATE = {
  username: string;
  fullName: string;
  email: string;
  oldPassword: string
  password: string;
  role: TROLE;
};
export type TUSERLOGIN = {
  email: string;
  password: string;
};

export type TVERIFYUSER = {
  email: string;
  OTP: string;
};

export type TCOOKIEOPTIONS = {
  httpOnly: true;
  secure: boolean;
  sameSite: "none";
  expires: Date;
};

export type TSENDOTP = {
  email: string;
};
