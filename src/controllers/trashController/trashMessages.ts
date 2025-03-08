import { NOTFOUNDMSG, SUCCESSCODE } from "../../constants";
import { db } from "../../database/db";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";

export default {
  getAllTrashedMessages: asyncHandler(async (req, res) => {
    const trashedMessages = await db.contactUs.findMany({
      where: {
        trashedBy: { not: null },
        trashedAt: { not: null }
      },
      select: {
        id: true,
        email: true,
        message: true,
        trashedBy: true,
        trashedAt: true,
        createdAt: true
      }
    });
    if (trashedMessages.length === 0) httpResponse(req, res, SUCCESSCODE, NOTFOUNDMSG, null);
    httpResponse(req, res, 200, "Data fetched successfully", trashedMessages);
  })
};
