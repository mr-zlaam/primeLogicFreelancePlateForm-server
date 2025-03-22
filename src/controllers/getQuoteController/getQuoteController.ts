import { BADREQUESTCODE, BADREQUESTMSG, NOTFOUNDCODE, NOTFOUNDMSG, SUCCESSCODE, SUCCESSMSG } from "../../constants";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";
import { sendThankYouForQuote } from "../../services/ThankYouForQuoteService";
import type { TGETQUOTE, TSERVICESFORQUOTE } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";

export default {
  // **   create quote controller
  createQuote: asyncHandler(async (req, res) => {
    const { name, email, phone, company, address, deadline, detail, services, ...rest } = req.body as TGETQUOTE;

    const data: TGETQUOTE = {
      name,
      email,
      phone,
      address,
      services,
      // Optional fields
      company: company ?? "",
      detail: detail ?? "",
      deadline: deadline || "",
      ...rest
    };
    const createdQuote = await db.getQuote.create({ data });
    await sendThankYouForQuote(createdQuote.email, createdQuote.name);
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, data);
  }),
  // **  create services for quote controlller
  createServicesForQuote: asyncHandler(async (req, res) => {
    const { services } = req.body as TSERVICESFORQUOTE;
    if (!services) throw { status: BADREQUESTCODE, message: BADREQUESTMSG };
    await db.createServicesForQuote.create({ data: { services } });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { services });
  }),
  // ** Delete services for quote controller
  deleteServicesForQuote: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw { status: BADREQUESTCODE, message: BADREQUESTMSG };
    const checkIfServiceExist = await db.createServicesForQuote.findUnique({ where: { id: Number(id) } });
    if (!checkIfServiceExist) throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
    await db.createServicesForQuote.delete({ where: { id: Number(id) } });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  }),
  // ** fetch single quote controller
  getSingleQuote: asyncHandler(async (req, res) => {
    const quote = await db.getQuote.findUnique({ where: { id: Number(req.params.id), trashedBy: null, trashedAt: null } });
    if (!quote) throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, quote);
  }),
  // ** fetch all qotes controller
  getAllQuote: asyncHandler(async (req, res) => {
    const quotes = await db.getQuote.findMany({ where: { trashedAt: null, trashedBy: null } });
    if (quotes.length === 0) httpResponse(req, res, SUCCESSCODE, NOTFOUNDMSG, null);

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, quotes);
  }),
  // ** Trash single quote controller
  trashQuote: asyncHandler(async (req: _Request, res) => {
    const uid = req.userFromToken?.uid;
    if (!uid) throw { status: BADREQUESTCODE, message: BADREQUESTMSG };
    const user = await db.user.findUnique({ where: { uid } });
    const quote = await db.getQuote.update({
      where: { id: Number(req.params.id) },
      data: { trashedBy: `@${user?.username} ${user?.fullName}-${user?.role}`, trashedAt: new Date() }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, quote);
  }),
  // ** Untrash Single controller
  unTrashQuote: asyncHandler(async (req: _Request, res) => {
    await db.getQuote.update({ where: { id: Number(req.params.id) }, data: { trashedBy: null, trashedAt: null } });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  }),
  // ** Delete Single controller
  deleteQuote: asyncHandler(async (req: _Request, res) => {
    const quote = await db.getQuote.delete({ where: { id: Number(req.params.id) } });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, quote);
  })
};
