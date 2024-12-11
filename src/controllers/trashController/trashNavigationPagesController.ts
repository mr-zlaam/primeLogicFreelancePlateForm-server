// import { NOTFOUNDCODE, NOTFOUNDMSG } from "../../constants";
// import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";
import { httpResponse } from "../../utils/apiResponseUtils";
// import { asyncHandler } from "../../utils/asyncHandlerUtils";
import type { Response } from "express";
export default {
  //   trashedNavigationPages: asyncHandler(async (req, res) => {
  //     const trashedPages = await db.navigationPages.findMany({
  //       where: {
  //         trashedBy: { not: null },
  //         trashedAt: { not: null }
  //       }
  //     });

  //     if (trashedPages.length === 0) throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
  //     httpResponse(req, res, 200, "Data fetched successfully", trashedPages);
  //   })
  // };
  trashedNavigationPages: (req: _Request, res: Response) => {
    httpResponse(req, res, 200, "Data fetched successfully");
  }
};
