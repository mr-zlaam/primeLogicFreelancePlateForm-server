import { HOST_EMAIL } from "../../config/config";
import {
  ADMINNAME,
  BADREQUESTCODE,
  BADREQUESTMSG,
  CONSULTATIONAPPROVALMESSAGEFROMADMIN,
  CONSULTATIONPENDINGMESSAGEFROMADMIN,
  INTERNALSERVERERRORCODE,
  INTERNALSERVERERRORMSG,
  NOTFOUNDCODE,
  NOTFOUNDMSG,
  SUCCESSCODE,
  SUCCESSMSG
} from "../../constants";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";

import { gloabalMailMessage } from "../../services/globalMailService";
import type { TCONSULTATION } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import logger from "../../utils/loggerUtils";

export default {
  // *** create consultaionBooking controller
  createConsultation: asyncHandler(async (req, res) => {
    const { name, email, phone, message, address, subject } = req.body as TCONSULTATION;
    const { bookingDate: stringyDate } = req.body as TCONSULTATION;
    const bookingDate = new Date(stringyDate);
    if (isNaN(bookingDate.getTime())) {
      throw { status: BADREQUESTCODE, message: "Invalid date format." };
    }
    if (bookingDate < new Date()) throw { status: BADREQUESTCODE, message: "Please enter a future date" };
    if (bookingDate.getDay() === 6) throw { status: BADREQUESTCODE, message: "We are closed on saturday" };
    if (bookingDate.getDay() === 0) throw { status: BADREQUESTCODE, message: "We are closed on sunday" };
    const bookingHour = bookingDate.getHours();
    logger.info("bookinghour", { bookingHour });
    if (bookingHour < 9 || bookingHour >= 17) {
      throw { status: BADREQUESTCODE, message: "Consultation time must be between 9 AM and 5 PM" };
    }
    const isConsultationDateAlreadyBooked = await db.consultationBooking.findUnique({
      where: {
        bookingDate: bookingDate
      }
    });
    if (isConsultationDateAlreadyBooked) throw { status: BADREQUESTCODE, message: "This date is already booked, Please choose another one" };
    const consultation = await db.consultationBooking.create({
      data: {
        name,
        email,
        phone,
        message,
        bookingDate,
        address,
        subject
      }
    });
    await Promise.all([
      // ** this email sent by user
      await gloabalMailMessage(email, message, "Consultation Request For Prime Logic Solution", `Dear ${name},`),
      await gloabalMailMessage(
        HOST_EMAIL,
        message,
        "Consultation Request For Prime Logic Solution",
        "Dear Administrators of PLS,",
        `User's orignal email is here: ${email} For more information check admin pannel of PLS`,
        name
      ),
      // ** this is auto generated reply for user
      await gloabalMailMessage(email, CONSULTATIONPENDINGMESSAGEFROMADMIN, "About your consultation request", `Dear ${name},`, "", ADMINNAME)
    ]);
    httpResponse(req, res, SUCCESSCODE, "Please check your email for more details", consultation);
  }),
  // *** Update consultation request
  updateConsultation: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw { status: BADREQUESTCODE, message: "Please send the id of consultaion request you want to update" };
    const { name, email, phone, message, address, subject } = req.body as TCONSULTATION;
    const { bookingDate: stringyDate } = req.body as TCONSULTATION;

    // Check if consultation exists
    const existingConsultation = await db.consultationBooking.findUnique({
      where: { id: Number(id) }
    });

    if (!existingConsultation) {
      throw { status: NOTFOUNDCODE, message: "Consultation not found" };
    }

    const bookingDate = new Date(stringyDate);

    // Reuse your date validation logic
    if (isNaN(bookingDate.getTime())) {
      throw { status: BADREQUESTCODE, message: "Invalid date format." };
    }

    if (bookingDate < new Date()) {
      throw { status: BADREQUESTCODE, message: "Please enter a future date" };
    }

    if (bookingDate.getDay() === 6) {
      throw { status: BADREQUESTCODE, message: "We are closed on saturday" };
    }

    if (bookingDate.getDay() === 0) {
      throw { status: BADREQUESTCODE, message: "We are closed on sunday" };
    }

    const bookingHour = bookingDate.getHours();
    logger.info("bookinghour", { bookingHour });

    if (bookingHour < 9 || bookingHour >= 17) {
      throw { status: BADREQUESTCODE, message: "Consultation time must be between 9 AM and 5 PM" };
    }

    const isConsultationDateAlreadyBooked = await db.consultationBooking.findFirst({
      where: {
        bookingDate,
        id: { not: Number(id) }
      }
    });

    if (isConsultationDateAlreadyBooked) {
      throw { status: BADREQUESTCODE, message: "This date is already booked, Please choose another one" };
    }

    // Update the consultation
    const updatedConsultation = await db.consultationBooking.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        message,
        bookingDate,
        address,
        subject
      }
    });

    // Send email notifications
    await Promise.all([
      await gloabalMailMessage(
        HOST_EMAIL,
        message,
        "Consultation Update For Prime Logic Solution",
        "Dear Administrators of PLS,",
        `Some one has updated the User's email in consultancy. User's update email is here: ${email} For more information check admin panel of PLS`,
        name
      ),

      await gloabalMailMessage(
        email,
        "Your consultation booking has been updated successfully",
        "Consultation Update Confirmation",
        `Dear ${name},`,
        "",
        ADMINNAME
      )
    ]);

    httpResponse(req, res, SUCCESSCODE, "Consultation updated successfully", updatedConsultation);
  }),
  // *** get all consultations controller
  getAllRequestedConsultations: asyncHandler(async (req, res) => {
    const consultations = await db.consultationBooking.findMany({ where: { trashedAt: null, trashedBy: null } });
    if (consultations.length === 0) httpResponse(req, res, SUCCESSCODE, NOTFOUNDMSG, null);
    httpResponse(req, res, SUCCESSCODE, "All consultations", consultations);
  }),

  // *** get single consultation
  getSingleRequestedConsultation: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const consultation = await db.consultationBooking.findUnique({ where: { id: Number(id), trashedBy: null, trashedAt: null } });
    if (!consultation) throw { status: NOTFOUNDCODE, message: "No consultation found" };
    httpResponse(req, res, SUCCESSCODE, "Single consultation", consultation);
  }),
  // ** delete consultation
  deleteRequestedConsultation: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const checkIfConsultationExists = await db.consultationBooking.findUnique({ where: { id: Number(id) } });
    if (!checkIfConsultationExists) throw { status: NOTFOUNDCODE, message: "No consultation found" };
    await db.consultationBooking
      .delete({ where: { id: Number(id) } })
      .then(() => httpResponse(req, res, SUCCESSCODE, "Deleted successfully"))
      .catch(() => {
        throw { status: INTERNALSERVERERRORCODE, message: INTERNALSERVERERRORMSG };
      });
  }),
  // ** Accept consultation booking
  acceptConsultationBooking: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const consultation = await db.consultationBooking.update({ where: { id: Number(id) }, data: { status: "ACCEPTED" } });
    // ** send acceptance email controller
    await gloabalMailMessage(
      consultation.email,
      `${CONSULTATIONAPPROVALMESSAGEFROMADMIN} <p>I hope you are ready on ${consultation.bookingDate.toLocaleDateString()} at ${consultation.bookingDate.toLocaleTimeString()}.</p><p>Best regards,</p><p>Prime Logic Solution</p>`,
      "Your consultation request got Accepted",
      `Dear ${consultation.name},`,
      "",
      ADMINNAME
    );
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  }),
  // ** Regect consultation booking
  rejectConsultationBooking: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rejectAndDeleteConsultaion = true } = req.body as { rejectAndDeleteConsultaion: boolean };
    if (!id) throw { status: BADREQUESTCODE, message: "Please send the id of consultaion request you want to reject" };
    const checkIfConsultationExists = await db.consultationBooking.findUnique({ where: { id: Number(id) } });
    if (!checkIfConsultationExists) throw { status: NOTFOUNDCODE, message: "No consultation found" };
    if (rejectAndDeleteConsultaion) {
      await db.consultationBooking.update({
        where: { id: Number(id), status: "PENDING" },
        data: { status: "REJECTED" }
      });
    }
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  }),
  // ** trash consultation
  trashConsultation: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const uid = req.userFromToken?.uid;
    if (!uid) throw { status: BADREQUESTCODE, message: BADREQUESTMSG };
    const user = await db.user.findUnique({ where: { uid } });
    //TODO: make sure you pass the correct id
    await db.consultationBooking.update({
      where: { id: Number(id) },
      data: { trashedAt: new Date(), trashedBy: `@${user?.username}-${user?.fullName}-${user?.role}` }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  }),
  // ** untrashConsultation
  untrashConsultation: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;

    //TODO: make sure you pass the correct id
    await db.consultationBooking.update({ where: { id: Number(id) }, data: { trashedAt: null, trashedBy: null } });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  })
};
