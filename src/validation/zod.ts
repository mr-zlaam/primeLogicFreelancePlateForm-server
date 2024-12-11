import { z } from "zod";
/*                                                       Authentication Schema                                                               */
// ** user registration schema
export const userRegistrationSchema = z.object({
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .min(3, {
      message: "Username must be at least 3 characters long. e.g: user123"
    })
    .max(50, { message: "Username can be at most 50 characters long. e.g: user123" })
    .regex(/^[a-z0-9_.]{1,20}$/, {
      message: "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123"
    }),
  fullName: z
    .string({ message: "fullName is required!!" })
    .min(1, { message: "fullName is required!!" })
    .min(3, {
      message: "Full name must be at least 3 characters long. e.g: John Doe"
    })
    .max(50, { message: "Full name can be at most 50 characters long. e.g: John Doe" })
    .regex(/^[a-zA-Z ]{3,20}$/, {
      message: "Full name can only contain letters and spaces. e.g: John Doe"
    }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    }),
  password: z
    .string({ message: "password is required!!" })
    .min(1, { message: "password is required!!" })
    .min(6, { message: "password must be at least 6 characters long." })
    .max(50, { message: "password can be at most 50 characters long." })
});

// ** user login schema
export const userLoginSchema = z.object({
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .max(100, { message: "username can be at most 100 characters long." }),
  password: z
    .string({ message: "password is required!!" })
    .min(1, { message: "password is required!!" })
    .max(100, { message: "password can be at most 100 characters long." })
});

// ** verify user schema
export const verifyUserSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
  OTP: z
    .string({ message: "OTP is required!!" })
    .min(1, { message: "OTP is required!!" })
    .min(6, { message: "OTP must be at least 6 characters long." })
    .max(6, { message: "OTP can be at most 6 characters long." })
});

export const sendOTPSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
});

export const userUpdateSchema = z.object({
  uid: z.string({ message: "uid is required!!" }).min(1, { message: "uid is required!!" }),
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .min(3, {
      message: "Username must be at least 3 characters long. e.g: user123"
    })
    .max(50, { message: "Username can be at most 50 characters long. e.g: user123" })
    .regex(/^[a-z0-9_.]{1,20}$/, {
      message: "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123"
    }),
  fullName: z
    .string({ message: "fullName is required!!" })
    .min(1, { message: "fullName is required!!" })
    .min(3, {
      message: "Full name must be at least 3 characters long. e.g: John Doe"
    })
    .max(50, { message: "Full name can be at most 50 characters long. e.g: John Doe" })
    .regex(/^[a-zA-Z ]{3,20}$/, {
      message: "Full name can only contain letters and spaces. e.g: John Doe"
    })
});
export const userUpdateEmailSchema = z.object({
  uid: z.string({ message: "uid is required!!" }).min(1, { message: "uid is required!!" }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    })
});

export const userUpdatePasswordSchema = z.object({
  uid: z.string({ message: "uid is required!!" }).min(1, { message: "uid is required!!" }),
  oldPassword: z
    .string({ message: "oldPassword  is required" })
    .min(1, { message: "oldPassword  is required" })
    .max(50, { message: "oldPassword  can be at most 50 characters long." }),
  password: z
    .string({ message: "newPassword is required!!" })
    .min(1, { message: "newPassword is required!!" })
    .min(6, { message: " newPassword must be at least 6 characters long." })
    .max(50, { message: " newPassword can be at most 50 characters long." })
});
export const userDeleteSchema = z.object({
  uid: z.string({ message: "uid is required!!" }).min(1, { message: "uid is required!!" })
});
/*                                                       Contact US Schema                                                               */

export const contactUsSchema = z.object({
  firstName: z
    .string({ message: "firstName is required!!" })
    .min(1, { message: "firstName is required!!" })
    .min(2, { message: "firstName must be at least 2 characters long." })
    .max(50, { message: "firstName can be at most 50 characters long." }),

  lastName: z
    .string({ message: "lastName is required!!" })
    .min(1, { message: "lastName is required!!" })
    .min(3, { message: "lastName must be at least 3 characters long." })
    .max(50, { message: "lastName can be at most 50 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
  message: z
    .string({ message: "message is required!!" })
    .min(1, { message: "message is required!!" })
    .min(3, { message: "message must be at least 3 characters long." })
    .max(500, { message: "message can be at most 500 characters long." })
});

export const sendMessagaeToUserSchema = z.object({
  id: z.number({ message: "id is required!!" }).min(1, { message: "id is required!!" }),
  message: z.string({ message: "message is required!!" }).min(1, { message: "message is required!!" })
});
/*                                                 news letter schema                                                    */
export const SubscribeORunsubscribeToNewsLetterSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    })
});
export const sendNewsLetterToSingleUserSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    }),
  newsLetter: z.string({ message: "newsLetter is required!!" }).min(1, { message: "newsLetter is required!!" })
});
export const sendNewsLetterToAllUsersSchema = z.object({
  newsLetter: z.string({ message: "newsLetter is required!!" }).min(1, { message: "newsLetter is required!!" })
});
// **** forgot password schema
export const forgotPasswordRequestFromUserSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    })
});
export const verifyForgotPasswordRequestSchema = z.object({
  OTP: z
    .string({ message: "OTP is required!!" })
    .min(1, { message: "OTP is required!!" })
    .min(6, { message: "OTP must be at least 6 characters long." })
    .max(6, { message: "OTP can be at most 6 characters long." })
});
export const updateForgotPasswordSchema = z.object({
  newPassword: z
    .string({ message: "newPassword is required!!" })
    .min(1, { message: "newPassword is required!!" })
    .min(6, { message: "newPassword must be at least 6 characters long." })
    .max(50, { message: "newPassword can be at most 50 characters long." })
});

// *** Get a Quote

export const getQuoteSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." })
    .max(1000, { message: "detail can be at most 150 characters long." }),
  services: z.string({ message: "services is required!!" }).min(1, { message: "services is required!!" })
});

// ** Consultation booking schema

export const consultationBookingSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  message: z
    .string({ message: "message is required!!" })
    .min(1, { message: "message is required!!" })
    .min(3, { message: "message must be at least 3 characters long." })
    .max(1000, { message: "message can be at most 150 characters long." }),
  bookingDate: z.string({ message: "bookingDate is required!!" }).min(1, { message: "bookingDate is required!!" }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 150 characters long." })
});

export const hireUsSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." })
    .max(1000, { message: "detail can be at most 1000 characters long." }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 150 characters long." })
});
//** Freelancer Schema
export const freeLancerSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com"
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." })
    .max(1000, { message: "detail can be at most 1000 characters long." }),
  niche: z
    .string({ message: "niche is required!!" })
    .min(1, { message: "niche is required!!" })
    .min(3, { message: "niche must be at least 3 characters long." })
    .max(450, { message: "niche can be at most 450 characters long." }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 450 characters long." }),
  yourPortfolio: z
    .string({ message: "yourPortfolio is required!!" })
    .min(1, { message: "yourPortfolio is required!!" })
    .min(3, { message: "yourPortfolio must be at least 3 characters long." })
    .max(450, { message: "yourPortfolio can be at most 450 characters long." }),
  yourTopProject1: z
    .string({ message: "yourTopProject1 is required!!" })
    .min(1, { message: "yourTopProject1 is required!!" })
    .min(3, { message: "yourTopProject1 must be at least 3 characters long." })
    .max(450, { message: "yourTopProject1 can be at most 450 characters long." }),
  yourTopProject2: z
    .string({ message: "yourTopProject2 is required!!" })
    .min(1, { message: "yourTopProject2 is required!!" })
    .min(3, { message: "yourTopProject2 must be at least 3 characters long." })
    .max(450, { message: "yourTopProject2 can be at most 450 characters long." }),
  yourTopProject3: z
    .string({ message: "yourTopProject3 is required!!" })
    .min(1, { message: "yourTopProject3 is required!!" })
    .min(3, { message: "yourTopProject3 must be at least 3 characters long." })
    .max(450, { message: "yourTopProject3 can be at most 450 characters long." })
});
// ** Project Schema
export const projectSchema = z.object({
  title: z
    .string({ message: "title is required!!" })
    .min(1, { message: "title is required!!" })
    .min(3, { message: "title must be at least 3 characters long." })
    .max(150, { message: "title can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." }),
  niche: z
    .string({ message: "niche is required!!" })
    .min(1, { message: "niche is required!!" })
    .min(3, { message: "niche must be at least 3 characters long." })
    .max(450, { message: "niche can be at most 450 characters long." }),
  bounty: z.number({ message: "bounty is required!!" }).min(1, { message: "bounty is required!!" }),
  deadline: z
    .string({ message: "deadline is required!!" })
    .min(1, { message: "deadline is required!!" })
    .min(3, { message: "deadline must be at least 3 characters long." })
    .max(450, { message: "deadline can be at most 450 characters long." })
});

// ** Blog post schema

export const blogPostSchema = z.object({
  blogTitle: z
    .string({ message: "blogTitle is required!!" })
    .min(1, { message: "blogTitle is required!!" })
    .min(3, { message: "blogTitle must be at least 3 characters long." })
    .max(450, { message: "blogTitle can be at most 450 characters long." }),
  blogThumbnail: z
    .string({ message: "blogThumbnail is required!!" })
    .min(1, { message: "blogThumbnail is required!!" })
    .min(3, { message: "blogThumbnail must be at least 3 characters long." })
    .max(450, { message: "blogThumbnail can be at most 450 characters long." }),
  blogOverview: z
    .string({ message: "blogOverview is required!!" })
    .min(1, { message: "blogOverview is required!!" })
    .min(3, { message: "blogOverview must be at least 3 characters long." })
    .max(650, { message: "blogOverview can be at most 450 characters long." }),
  blogBody: z
    .string({ message: "blogBody is required!!" })
    .min(1, { message: "blogBody is required!!" })
    .min(3, { message: "blogBody must be at least 3 characters long." })
});
// Service schema
export const serviceSchema = z.object({
  name: z
    .string({ message: "service name is required!!" })
    .min(1, { message: "service name is required!!" })
    .min(3, { message: "service name must be at least 3 characters long." })
    .max(450, { message: "service name can be at most 450 characters long." }),
  subServiceTitle: z
    .string({ message: "sub-service title is required!!" })
    .min(1, { message: "sub-service title is required!!" })
    .min(3, { message: "sub-service title must be at least 3 characters long." })
    .max(450, { message: "sub-service title can be at most 450 characters long." }),
  subServiceDescription: z
    .string({ message: "sub-service description is required!!" })
    .min(1, { message: "sub-service description is required!!" })
    .min(3, { message: "sub-service description must be at least 3 characters long." })
    .max(650, { message: "sub-service description can be at most 450 characters long." })
  // serviceDetail: z
  //   .string({ message: "service detail is required!!" })
  //   .min(1, { message: "service detail is required!!" })
  //   .min(3, { message: "service detail must be at least 3 characters long." })
});
