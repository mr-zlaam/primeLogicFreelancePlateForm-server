import { BADREQUESTCODE, NOTFOUNDCODE, SUCCESSCODE, SUCCESSMSG } from "../../constants";
import { db } from "../../database/db";
import { generateSlug } from "../../services/slugStringGeneratorService";
import type { TPROJECT } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";

export default {
  createProject: asyncHandler(async (req, res) => {
    // ** validation is already handled by middleware
    const projectData = req.body as TPROJECT;
    let deadline = projectData.deadline;

    if (deadline.length === 16) {
      deadline += ":00.000Z";
    } else if (deadline.length === 19) {
      deadline += ".000Z";
    } else if (deadline.length === 23) {
      deadline += "Z";
    } else if (deadline.length !== 25) {
      throw { status: BADREQUESTCODE, message: "Please enter a valid date" };
    }

    // Validate the final date string
    const newDeadLine = new Date(deadline);
    if (isNaN(newDeadLine.getTime())) {
      throw { status: BADREQUESTCODE, message: "Invalid date format." };
    }
    if (newDeadLine < new Date()) {
      throw { status: BADREQUESTCODE, message: "Deadline must be in the future." };
    }
    const projectSlug = generateSlug(projectData.title);
    const niche = generateSlug(projectData.niche);
    const clientWhoPostedThisProjectForeignIdExists = await db.user.findUnique({
      where: { uid: projectData.clientWhoPostedThisProjectForeignId || "" }
    });
    if (!clientWhoPostedThisProjectForeignIdExists) throw { status: BADREQUESTCODE, message: "Client id does not exist." };
    const isProjectAlreadyExist = await db.project.findUnique({ where: { projectSlug: projectSlug, title: projectData.title } });
    if (isProjectAlreadyExist) {
      throw { status: BADREQUESTCODE, message: "Project already exist with same title." };
    }
    if (!projectData.clientWhoPostedThisProjectForeignId) throw { status: BADREQUESTCODE, message: "Client id is required." };
    const createdProject = await db.project.create({
      data: {
        title: projectData.title,
        detail: projectData.detail,
        bounty: projectData.bounty,
        deadline: newDeadLine,
        niche: niche,
        projectSlug: projectSlug,
        difficultyLevel: "EASY",
        progressPercentage: 0,
        projectStatus: "PENDING",
        clientWhoPostedThisProjectForeignId: projectData.clientWhoPostedThisProjectForeignId
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
        clientWhoPostedThisProject: { select: { username: true, uid: true, fullName: true, email: true } },
        interestedFreelancers: { select: { username: true, uid: true, fullName: true, email: true, portfolioUrl: true, phone: true } },
        selectedFreelancers: { select: { username: true, uid: true, fullName: true, email: true } },
        projectSlug: true,
        projectStatus: true,
        createdAt: true
      }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, createdProject);
  }),

  // ** Get Single Project By Slug
  getSingleProject: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await db.project.findUnique({
      where: { projectSlug: projectSlug, trashedAt: null, trashedBy: null },
      select: {
        id: true,
        title: true,
        detail: true,
        deadline: true,
        bounty: true,
        progressPercentage: true,
        niche: true,
        difficultyLevel: true,
        clientWhoPostedThisProject: { select: { username: true, uid: true, fullName: true, email: true } },
        interestedFreelancers: {
          select: { username: true, uid: true, fullName: true, email: true, niche: true, portfolioUrl: true, kpiRankPoints: true, kpiRank: true }
        },
        selectedFreelancers: { select: { username: true, uid: true, fullName: true, email: true } },
        commentByClientAfterProjectCompletion: true,
        starsByClientAfterProjectCompletion: true,
        projectSlug: true,
        projectStatus: true,
        projectType: true,
        createdAt: true
      }
    });
    if (!project) throw { status: BADREQUESTCODE, message: "Project not found." };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, project);
  }),

  // ** Get All OutSourced Projects

  // **  Delete Project By Slug
  deleteProject: asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    await db.project
      .findUniqueOrThrow({ where: { id: Number(id) } })
      .then((res) => res)
      .catch(() => {
        throw { status: NOTFOUNDCODE, message: "Project not found." };
      });
    const project = await db.project.delete({ where: { id: Number(id) } });
    if (project) throw { status: BADREQUESTCODE, message: "Project not found." };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, null);
  })
};
