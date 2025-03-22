import { HOST_EMAIL } from "../../config/config";
import { BADREQUESTCODE, NOTFOUNDCODE, NOTFOUNDMSG, SUCCESSCODE, SUCCESSMSG } from "../../constants";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";
import { recieveMessageFromUser } from "../../services/recieveMessageFromUserService";
import { sendMessageToTheUserService } from "../../services/sendMessageToUserService";
import type { TCONTACTUS, TTRASH, TUSER } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { findUniqueUser } from "../../utils/findUniqueUtils";

export default {
  // create message controller
  createMessage: asyncHandler(async (req, res) => {
    // ** Validation is handled by middleware
    const { firstName, lastName, email, message } = req.body as TCONTACTUS;
    const user = await findUniqueUser(email);
    await Promise.all([
      recieveMessageFromUser(email, HOST_EMAIL, message, `${firstName} ${lastName}`),
      db.contactUs.create({
        data: {
          firstName,
          lastName,
          email,
          message,
          from: user ? user.role : "Unregistered User"
        }
      })
    ]);
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { firstName, lastName, email, message });
  }),
  // ** get all message controller
  getAllMessages: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [messages, totalMessages] = await Promise.all([
      db.contactUs.findMany({
        where: { trashedBy: null },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc"
        },
        select: { id: true, email: true, message: true, firstName: true, lastName: true, from: true, createdAt: true }
      }),
      db.contactUs.count({ where: { trashedBy: null } })
    ]);

    const totalPages = Math.ceil(totalMessages / limit);

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      page,
      totalPages,
      limit,
      totalMessages,
      ...messages
    });
  }),

  // get Single message controller
  getSingleMessage: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw { status: BADREQUESTCODE, message: "Id is required!" };
    const message = await db.contactUs.findUnique({
      where: {
        id: Number(id),
        trashedBy: null
      },
      select: { id: true, email: true, message: true, firstName: true, lastName: true, from: true, createdAt: true }
    });
    if (!message) throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
    else {
      httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, message);
    }
  }),

  sendMessageToUser: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw { status: BADREQUESTCODE, message: "Id is required!" };
    const { message: messageByAdmin } = req.body as TCONTACTUS;
    // ** validation is already handled by middleware
    const message = await db.contactUs.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!message) throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
    await sendMessageToTheUserService(message.email, messageByAdmin, `${message.firstName} ${message.lastName}`);
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { messageByAdmin, message: `Replied to this message: ${message.message}` });
  }),

  // delete message controller
  deleteMessage: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Attempt to delete the message
    const deletedMessage = await db.contactUs.delete({
      where: {
        id: Number(id)
      }
    });

    if (!deletedMessage) throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
    else {
      httpResponse(req, res, SUCCESSCODE, "Message deleted successfully", deletedMessage);
    }
  }),

  // ** Trash the message
  trashMessage: asyncHandler(async (req: _Request, res) => {
    const { victimUid: idOfMessageWhichIsGoingToTrashed } = req.body as TTRASH;
    const trashedBy = req.userFromToken?.uid as string;
    if (!trashedBy) throw { status: BADREQUESTCODE, message: "Please Send the id of user who want to trash it" };
    const user: TUSER = await findUniqueUser(trashedBy);
    if (!idOfMessageWhichIsGoingToTrashed) throw { status: BADREQUESTCODE, message: "Please send the id of message" };
    await db.contactUs.update({
      where: {
        id: Number(idOfMessageWhichIsGoingToTrashed)
      },
      data: {
        trashedBy: `@${user?.username} - ${user?.fullName} - ${user?.role}`,
        trashedAt: new Date()
      }
    });

    httpResponse(req, res, SUCCESSCODE, "Message trashed successfully");
  }),

  // ** Untrash the message
  unTrashMessage: asyncHandler(async (req, res) => {
    const { victimUid: idOfMessageWhichIsGoingToUnTrashed } = req.body as TTRASH;
    if (!idOfMessageWhichIsGoingToUnTrashed) throw { status: BADREQUESTCODE, message: "Please send the id of message" };
    await db.contactUs.update({
      where: {
        id: Number(idOfMessageWhichIsGoingToUnTrashed)
      },
      data: {
        trashedBy: null,
        trashedAt: null
      }
    });
    httpResponse(req, res, SUCCESSCODE, "Message untrashed successfully");
  })
};
