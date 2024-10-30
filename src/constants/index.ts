const messages = {
  ERRMSG: "Something went wrong",
  SUCCESSMSG: "Operation was successful",
  NOTFOUNDMSG: "Not Found",
  BADREQUESTMSG: "Bad Request",
  UNAUTHORIZEDMSG: "Unauthorized",
  FORBIDDENMSG: "Forbidden",
  INTERNALSERVERERRORMSG: "Internal Server Error"
  // CODES
};
export const { ERRMSG, SUCCESSMSG, NOTFOUNDMSG, BADREQUESTMSG, UNAUTHORIZEDMSG, FORBIDDENMSG, INTERNALSERVERERRORMSG } = messages;

const statusCodes = {
  SUCCESSCODE: 200,
  CREATEDCODE: 201,
  BADREQUESTCODE: 400,
  UNAUTHORIZEDCODE: 401,
  FORBIDDENCODE: 403,
  NOTFOUNDCODE: 404,
  INTERNALSERVERERRORCODE: 500
};
export const { SUCCESSCODE, CREATEDCODE, BADREQUESTCODE, UNAUTHORIZEDCODE, FORBIDDENCODE, NOTFOUNDCODE, INTERNALSERVERERRORCODE } = statusCodes;

const ENDPOINTS = {
  HEALTHROUTE: "/api/v1/health",
  AUTHROUTE: "/api/v1/auth"
};
export const { HEALTHROUTE, AUTHROUTE } = ENDPOINTS;
