// Single line types
export type TENV = "DEVELOPMENT" | "PRODUCTION";

export type TROLE = "CLIENT" | "ADMIN" | "MODERATOR" | "FREELANCER";
// Multiline types
export type TPAYLOAD = {
  uid: string;
  tokenVersion: number;
  role: TROLE;
  isVerified: Date | null;
};
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
export type TUSER = {
  uid: string;
  username: string;
  fullName: string;
  email: string;
  emailVerifiedAt: Date | null;
  role: TROLE;
  createdAt?: Date;
  updatedAt?: Date;
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
  uid: string;
  username: string;
  fullName: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  role: TROLE;
};
export type TUSERLOGIN = {
  username: string;
  password: string;
};

export type TTRASH = {
  victimUid: string;
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

export type TCONTACTUS = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export type TSUBSCRIBENEWSLETTER = {
  email: string;
  newsLetter: string;
};
// export type TNAVIGATIONPAGE = {
//   data: object[];
// };

export type TSERVICECATEGORY = {
  name: string;
};
export type TSERVICE = {
  name: string;
  categoryId: string;
  name: string;
  description: string;
  detailPage: string;
};

export type TGETQUOTE = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  deadline?: string;
  services: string;
  detail?: string;
  trashedBy?: string;
  trashedAt?: Date;
};
export type TSERVICESFORQUOTE = {
  services: string;
};

export type TCONSULTATIONSTATUS = "PENDING" | "ACCEPTED" | "REJECTED" | "FINISHED";
export type TCONSULTATION = {
  name: string;
  email: string;
  phone: string;
  message: string;
  address: string;
  bookingDate: string;
};

export type THIREUS = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  detail: string;
};

type THIREUSDOCUMENT = {
  url?: string;
  name?: string;
};

export type THIREUSDATA = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  address: string;
  detail: string;
  docs: Document[];
  createdAt: string; // ISO date string format
  trashedBy: string | null;
  trashedAt: string | null;
};

export type THIREUSRESPONSE = THIREUSDATA[];
// ********* Freelancer
export type TFREELANCER = {
  name: string;
  email: string;
  phone: string;
  yourPortfolio: string;
  yourTopProject1: string;
  yourTopProject2: string;
  yourTopProject3: string;
  address: string;
  detail: string;
  niche: string;
  createdAt: string; // ISO date string format
  trashedBy: string | null;
  trashedAt: string | null;
};

export type TPROJECTSTATUS = "PENDING" | "CANCELLED" | "ONGOING" | "COMPLETED";
export type TKPIRANK = "BRONZE" | "SILVER" | "GOLD" | "PLATINIUM" | "DIAMOND" | "CROWN" | "ACE" | "CONQUERER";
export type TDIFFICULTYLEVEL = "EASY" | "MEDIUM" | "HARD";
export type TPROJECTTYPE = "INHOUSE" | "OUTSOURCE";
export type TPROJECT = {
  title: string;
  detail: string;
  projectType: TPROJECTTYPE;
  niche: string;
  bounty: number;
  deadline: string;
  projectStatus: TPROJECTSTATUS;
  progressPercentage: number;
  isDeadlineNeedToBeExtend: boolean;
  difficultyLevel: DIFFICULTY_LEVEL;
  clientWhoPostedThisProjectForeignId?: string;
  selectedFreelancersForThisProject: string[];
  interestedFreelancerWhoWantToWorkOnThisProject: string[];
  commentByClientAfterProjectCompletion?: string;
  starsByClientAfterProjectCompletion?: string;
};
export type TFILTEREDPROJECT = {
  trashedAt: null;
  trashedBy: null;
  projectType?: TPROJECTTYPE;
  projectStatus?: TPROJECTSTATUS;
  difficultyLevel?: TDIFFICULTYLEVEL;
  niche?: string;
};

// Define types for query parameters
export type TGETPROJECTSQUERY = {
  page?: string;
  limit?: string;
  difficultyLevel?: TDIFFICULTYLEVEL;
  createdAtOrder?: "oldest" | "latest" | "";
  bountyOrder?: "lowest" | "highest" | "";
  nicheName?: string;
};
export interface TGETFULLPROJECTQUERY extends TGETPROJECTSQUERY {
  projectType?: TPROJECTTYPE | "";
  projectStatus?: TPROJECTSTATUS | "";
}

// Define filters type

// Define type for sorting
export type TSORTORDER = {
  createdAt?: "asc" | "desc";
  bounty?: "asc" | "desc";
};

// ** type for blog post
export type TBLOGPOST = {
  blogTitle: string;
  blogThumbnail: string;
  blogOverview: string;
  blogBody: string;
  isPublished?: boolean;
};
