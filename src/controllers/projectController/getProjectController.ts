import { BADREQUESTCODE, NOTFOUNDCODE, SUCCESSCODE, SUCCESSMSG } from "../../constants";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";
import type { TFILTEREDPROJECT, TGETFULLPROJECTQUERY, TGETPROJECTSQUERY, TSORTORDER } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";

export default {
  getAllProjectsWithThierClient: asyncHandler(async (req, res) => {
    const { clientId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    if (!clientId) throw { status: BADREQUESTCODE, message: "Client id is required" };
    const client = await db.user.findFirst({
      where: {
        uid: clientId
      }
    });

    if (!client) {
      throw { status: NOTFOUNDCODE, message: "Client not found" };
    }

    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    if (isNaN(pageNumber) || isNaN(pageLimit) || pageNumber <= 0 || pageLimit <= 0) {
      throw { status: BADREQUESTCODE, message: "Invalid pagination parameters!!" };
    }

    const skip = (pageNumber - 1) * pageLimit;
    const take = pageLimit;

    const projects = await db.project.findMany({
      where: {
        clientWhoPostedThisProjectForeignId: clientId,
        trashedAt: null,
        trashedBy: null
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        title: true,
        detail: true,
        deadline: true,
        bounty: true,
        progressPercentage: true,
        niche: true,
        difficultyLevel: true,
        projectType: true,
        projectStatus: true,
        projectSlug: true,
        createdAt: true,
        milestones: true,
        clientWhoPostedThisProject: {
          select: {
            uid: true,
            fullName: true,
            email: true,
            username: true,
            phone: true,
            country: true,
            address: true
          }
        }
      }
    });

    const totalProjects = await db.project.count({
      where: {
        clientWhoPostedThisProjectForeignId: clientId,
        trashedAt: null,
        trashedBy: null
      }
    });

    const totalPages = Math.ceil(totalProjects / pageLimit);
    const hasNextPage = totalPages > pageNumber;
    const hasPreviousPage = pageNumber > 1;

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      projects,
      pagination: {
        totalPages,
        totalProjects,
        currentPage: pageNumber,
        hasPreviousPage,
        hasNextPage
      }
    });
  }),

  getAllProjects: asyncHandler(async (req, res) => {
    // Destructure and parse query parameters with types
    const { page = "1", limit = "10", difficultyLevel, nicheName = "", projectType = "", projectStatus = "" }: TGETFULLPROJECTQUERY = req.query;
    let { createdAtOrder = "latest", bountyOrder = "" }: TGETFULLPROJECTQUERY = req.query;
    const pageNum = Number(page || 10);
    const pageSize = Number(limit || 10);
    const skip = (pageNum - 1) * pageSize;

    const filters: TFILTEREDPROJECT = {
      trashedAt: null,
      trashedBy: null
    };

    if (difficultyLevel) {
      filters.difficultyLevel = difficultyLevel;
    }
    if (nicheName) {
      filters.niche = nicheName;
    }
    if (projectType) {
      filters.projectType = projectType;
    }
    if (projectStatus) {
      filters.projectStatus = projectStatus;
    }

    const orderBy: TSORTORDER[] = [];
    if (createdAtOrder) {
      bountyOrder = "";
      orderBy.push({
        createdAt: createdAtOrder === "latest" ? "desc" : "asc"
      });
    }
    if (bountyOrder) {
      createdAtOrder = "";
      orderBy.push({
        bounty: bountyOrder === "highest" ? "desc" : "asc"
      });
    }

    const projects = await db.project.findMany({
      where: { ...filters },
      skip,
      take: pageSize,
      orderBy: orderBy,
      select: {
        id: true,
        title: true,
        detail: true,
        deadline: true,
        bounty: true,
        progressPercentage: true,
        niche: true,
        difficultyLevel: true,
        milestones: true,
        projectType: true,
        projectStatus: true,
        projectSlug: true,
        createdAt: true
      }
    });

    const totalProjects = await db.project.count({ where: { ...filters } });

    const response = {
      projects,
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(totalProjects / pageSize),
        totalProjects
      }
    };

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, response);
  }),
  getProjectForSelectedFreelancers: asyncHandler(async (req: _Request, res) => {
    const id = req.userFromToken?.uid;
    if (!id) throw { status: BADREQUESTCODE, message: "user id is required" };

    const { page = "1", limit = "10" } = req.query;

    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    if (isNaN(pageNumber) || isNaN(pageLimit) || pageNumber <= 0 || pageLimit <= 0) {
      throw { status: BADREQUESTCODE, message: "Invalid pagination parameters" };
    }

    const skip = (pageNumber - 1) * pageLimit;
    const take = pageLimit;

    const projects = await db.project.findMany({
      where: {
        selectedFreelancers: { some: { uid: id } },
        projectStatus: "ONGOING",
        trashedAt: null,
        trashedBy: null
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        title: true,
        detail: true,
        deadline: true,
        milestones: true,
        bounty: true,
        progressPercentage: true,
        niche: true,
        difficultyLevel: true,
        projectType: true,
        projectStatus: true,
        projectSlug: true,
        createdAt: true
      }
    });
    const totalProjects = await db.project.count({
      where: {
        selectedFreelancers: { some: { uid: id } },
        trashedAt: null,
        trashedBy: null
      }
    });

    const totalPages = Math.ceil(totalProjects / pageLimit);
    const hasNextPage = totalPages > pageNumber;
    const hasPreviousPage = pageNumber > 1;

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      projects,
      pagination: {
        totalPages,
        totalProjects,
        currentPage: pageNumber,
        hasPreviousPage,
        hasNextPage
      }
    });
  }),

  getAllOutsourcedProjects: asyncHandler(async (req, res) => {
    // Destructure and parse query parameters with types
    const {
      page = "1",
      limit = "10",
      difficultyLevel,
      createdAtOrder = "latest",
      bountyOrder = "lowest",
      nicheName = ""
    }: TGETPROJECTSQUERY = req.query;

    const pageNum = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNum - 1) * pageSize;

    const filters: TFILTEREDPROJECT = {
      trashedAt: null,
      trashedBy: null,
      projectType: "OUTSOURCE" as const,
      projectStatus: "PENDING"
    };

    if (difficultyLevel) {
      filters.difficultyLevel = difficultyLevel;
    }
    if (nicheName) {
      filters.niche = nicheName;
    }

    const orderBy: TSORTORDER[] = [];

    orderBy.push({
      createdAt: createdAtOrder ? "desc" : "asc"
    });

    orderBy.push({
      bounty: bountyOrder ? "desc" : "asc"
    });

    const projects = await db.project.findMany({
      where: { ...filters },
      skip,
      take: pageSize,
      orderBy: orderBy,
      select: {
        id: true,
        title: true,
        detail: true,
        milestones: true,
        deadline: true,
        bounty: true,
        progressPercentage: true,
        niche: true,
        difficultyLevel: true,
        projectType: true,
        projectStatus: true,
        projectSlug: true,
        createdAt: true
      }
    });

    const totalProjects = await db.project.count({ where: { ...filters } });

    const response = {
      projects,
      pagination: {
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(totalProjects / pageSize),
        totalProjects
      }
    };

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, response);
  })
};
