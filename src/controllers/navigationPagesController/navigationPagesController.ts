import { db } from "../../database/db";
import type { TSERVICECATEGORY } from "../../types";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { httpResponse } from "../../utils/apiResponseUtils";
import { BADREQUESTCODE, BADREQUESTMSG, SUCCESSCODE, SUCCESSMSG } from "../../constants";
import type { _Request } from "../../middlewares/authMiddleware";
// import logger from "../../utils/loggerUtils";

export default {
  // ** Create navigation page controller
  createCategory: asyncHandler(async (req: _Request, res) => {
    const { name } = req.body as TSERVICECATEGORY;
    if (!name) {
      throw {
        status: BADREQUESTCODE,
        message: BADREQUESTMSG
      };
    }
    await db.serviceCategory.create({ data: { name: name } });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { name });
  })
  // updateService: asyncHandler(async (req: _Request, res) => {
  //   const { serviceDetail, id } = req.body as TSERVICE;

  //   if (!serviceDetail) {
  //     throw {
  //       status: BADREQUESTCODE,
  //       message: BADREQUESTMSG
  //     };
  //   }
  //   if (!id) {
  //     throw {
  //       status: BADREQUESTCODE,
  //       message: BADREQUESTMSG
  //     };
  //   }
  //   logger.info(serviceDetail);
  //   await db.service.update({
  //     where: { id: +id },
  //     data: { serviceDetail: serviceDetail }
  //   });
  //   httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { message: `services detail updated successfully!` });
  // }),
  // getAllServices: asyncHandler(async (req: _Request, res) => {
  //   const allServices = await db.service.findMany({ select: { name: true, slug: true, subServiceTitle: true } });
  //   httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { message: `single service fetched!`, allServices: allServices });
  // }),
  // getSingleService: asyncHandler(async (req: _Request, res) => {
  //   const { slug } = req.body as TSERVICE;
  //   if (!slug) {
  //     throw {
  //       status: BADREQUESTCODE,
  //       message: BADREQUESTMSG
  //     };
  //   }
  //   const singleService = await db.service.findUnique({ where: { slug: slug } });

  //   httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { message: `single service fetched!`, singleService: singleService });
  // })
};
