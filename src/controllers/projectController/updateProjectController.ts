import { BADREQUESTCODE, NOTFOUNDCODE, SUCCESSCODE, SUCCESSMSG } from "../../constants";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";
import { generateSlug } from "../../services/slugStringGeneratorService";
import type { TPROJECT, TUPDATE_PROJECT } from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import { calculate90Percent } from "../../utils/bountyPercentageDividerUtils";
import { findUniqueProject } from "../../utils/findUniqueUtils";
import { calculateKpiPoints } from "../../utils/kpiCalculaterUtils";
import logger from "../../utils/loggerUtils";
import { updateFreelancerRank } from "../../utils/updateFreelancerRankUtils";

export default {
  // ** create List of interested freelancers who want to work on this project
  createInterestedFreelancers: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const { interestedFreelancerWhoWantToWorkOnThisProject } = req.body as TPROJECT;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    if (!Array.isArray(interestedFreelancerWhoWantToWorkOnThisProject))
      throw { status: BADREQUESTCODE, message: "Send The array  of ID's of freelancer who is interested." };
    const updateProject = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { interestedFreelancers: { connect: interestedFreelancerWhoWantToWorkOnThisProject.map((id) => ({ uid: id })) } },
      select: { interestedFreelancers: { select: { uid: true, username: true, fullName: true, email: true } } }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, updateProject);
  }),
  // ** Remove Freelancer from Interested List
  removeFreelancerFromInterestedList: asyncHandler(async (req: _Request, res) => {
    const { projectSlug } = req.params;
    const freelancerUid = req.userFromToken?.uid;
    logger.info(freelancerUid);
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    if (!freelancerUid) throw { status: BADREQUESTCODE, message: "Freelancer uid is required." };
    const updatedProject = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { interestedFreelancers: { disconnect: { uid: freelancerUid } } },
      select: {
        interestedFreelancers: { select: { uid: true, username: true, fullName: true, email: true } }
      }
    });
    await db.user.update({
      where: { uid: freelancerUid },
      data: { kpiRankPoints: { decrement: 10 } }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      message: "Freelancer removed from interested list successfully.",
      updatedProject
    });
  }),
  // ** List all the interested freelancers who want to work on this project
  listInterestedFreelancersInSingleProject: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await db.project.findUnique({
      where: { projectSlug: projectSlug },
      select: {
        interestedFreelancers: { select: { uid: true, username: true, fullName: true, email: true } }
      }
    });
    if (!project) throw { status: NOTFOUNDCODE, message: "Project not found." };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, project.interestedFreelancers);
  }),

  // ** Select Freelancer for project
  selectFreelancerForProject: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const { selectedFreelancersForThisProject: freelancerName } = req.body as TPROJECT;
    if (!freelancerName) throw { status: BADREQUESTCODE, message: "Freelancer name is required." };
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const selectFreeLancer = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { selectedFreelancers: { connect: freelancerName.map((freelancer) => ({ username: freelancer })) } },
      select: { selectedFreelancers: { select: { uid: true, username: true, fullName: true, email: true } } }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, selectFreeLancer);
  }),
  // ** remove selected Freelancer
  removeSelectedFreelancer: asyncHandler(async (req: _Request, res) => {
    const { projectSlug } = req.params;
    const { uid: freelancerUid } = req.body as { uid: string };
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    if (!freelancerUid) throw { status: BADREQUESTCODE, message: "Freelancer username is required." };
    const updatedProject = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { selectedFreelancers: { disconnect: [{ uid: freelancerUid }] } },
      select: { selectedFreelancers: { select: { uid: true, username: true, fullName: true, email: true } } }
    });
    await db.user.update({
      where: { uid: freelancerUid },
      data: { kpiRankPoints: { decrement: 40 } }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, {
      message: "Freelancer removed from selected list successfully.",
      updatedProject
    });
  }),
  // ** Update Project By Slug
  updateProgressOfProject: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const { freelancerName } = req.body as { freelancerName: string };
    let { progressPercentage } = req.body as TPROJECT;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await findUniqueProject(projectSlug);
    if (!project?.selectedFreelancersForThisProject.includes(freelancerName))
      throw { status: BADREQUESTCODE, message: "You can't update progress of this project since you are not working on this project" };
    if (project.projectStatus !== "ONGOING") throw { status: BADREQUESTCODE, message: "You can't update progress of completed or pending project" };
    if (!project) throw { status: NOTFOUNDCODE, message: "Project not found." };
    if (!progressPercentage) throw { status: BADREQUESTCODE, message: "Progress percentage is required." };
    if (isNaN(progressPercentage)) throw { status: BADREQUESTCODE, message: "Progress percentage must be a number." };
    else progressPercentage = Number(progressPercentage);
    if (progressPercentage > 100 || progressPercentage < 0)
      throw { status: BADREQUESTCODE, message: "Progress percentage must be between 0 and 100." };
    if (project?.progressPercentage > progressPercentage) throw { status: BADREQUESTCODE, message: "You can't update progress backward" };
    const updateProgressOfProject = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { progressPercentage: Number(progressPercentage) }
    });
    if (updateProgressOfProject.progressPercentage === 100) {
      await db.project.update({ where: { projectSlug: projectSlug }, data: { projectStatus: "COMPLETED" } });
    }
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { progressPercentage: updateProgressOfProject.progressPercentage });
  }),
  // ** Change the status of a project
  changeProjectStatus: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const { projectStatus } = req.body as TPROJECT;
    if (!projectStatus) throw { status: BADREQUESTCODE, message: "Field is required." };
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await db.project.update({ where: { projectSlug: projectSlug }, data: { projectStatus: projectStatus } });
    if (!project) throw { status: NOTFOUNDCODE, message: "Project not found." };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { projectStatus: project.projectStatus });
  }),
  // ** Change the Project Type
  changeProjectType: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const { projectType } = req.body as TPROJECT;
    if (!projectType) throw { status: BADREQUESTCODE, message: "Field is required." };
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await db.project.update({ where: { projectSlug: projectSlug }, data: { projectType: projectType } });
    if (!project) throw { status: NOTFOUNDCODE, message: "Project not found." };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { projectType: project.projectType });
  }),
  // ** Get All Projects

  writeReviewAndGiveRating: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const { starsByClientAfterProjectCompletion, commentByClientAfterProjectCompletion: review } = req.body as TPROJECT;
    if (!review) throw { status: BADREQUESTCODE, message: "You can't rate without comment." };
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await db.project.findUnique({ where: { projectSlug: projectSlug } });
    if (project?.projectStatus !== "COMPLETED") throw { status: BADREQUESTCODE, message: "Project must be completed to give rating." };
    const updatedProject = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { commentByClientAfterProjectCompletion: review, starsByClientAfterProjectCompletion: Number(starsByClientAfterProjectCompletion) },
      select: {
        selectedFreelancers: { select: { uid: true, username: true } },
        difficultyLevel: true,
        starsByClientAfterProjectCompletion: true
      }
    });
    await Promise.all(
      updatedProject.selectedFreelancers.map(async (freelancer) => {
        const kpiRankPoints = await calculateKpiPoints({
          uid: freelancer.uid,
          difficulty: updatedProject.difficultyLevel,
          rating: updatedProject.starsByClientAfterProjectCompletion || 0
        });
        await updateFreelancerRank(freelancer.uid, kpiRankPoints);
      })
    );
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG);
  }),
  // ** Update Project by Slug
  updateProjectBySlug: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    const updatedData = req.body as TUPDATE_PROJECT;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const deadLineDate = new Date(updatedData.deadline);
    // check if deadline  ISO-8601 format or not
    if (isNaN(deadLineDate.getTime())) throw { status: BADREQUESTCODE, message: "Invalid deadline date." };
    if (deadLineDate < new Date()) throw { status: BADREQUESTCODE, message: "Deadline must be a future date." };
    const project = await db.project.update({
      where: { projectSlug: projectSlug },
      data: { ...updatedData, projectSlug: generateSlug(updatedData.title), bounty: calculate90Percent(updatedData.bounty), deadline: deadLineDate }
    });
    if (!project) throw { status: NOTFOUNDCODE, message: "Project not found." };
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { project });
  }),
  // ** Make this project outsource
  makeProjectOutsource: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const project = await db.project.findUnique({ where: { projectSlug: projectSlug }, select: { bounty: true, projectType: true } });
    if (!project) throw { status: NOTFOUNDCODE, message: "Project not found." };
    if (project.projectType === "OUTSOURCE") {
      throw { status: BADREQUESTCODE, message: "Project is already outsource." };
    }
    await db.project.update({
      where: { projectSlug: projectSlug },
      data: { projectType: "OUTSOURCE", bounty: calculate90Percent(project?.bounty || 0) }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { project });
  }),
  acceptExtensionInProjectDeadline: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    const { requestExtensionInDeadline } = req.body as TUPDATE_PROJECT;
    const extendedDate = new Date(requestExtensionInDeadline);
    if (isNaN(extendedDate.getTime())) throw { status: BADREQUESTCODE, message: "Invalid deadline date." };
    if (extendedDate < new Date()) throw { status: BADREQUESTCODE, message: "Deadline must be a future date." };
    await db.project.update({
      where: { projectSlug: projectSlug },
      data: {
        requestExtensionInDeadline: null,
        deadline: extendedDate,
        projectBannerMessage: `Deadline extended to ${extendedDate.toLocaleDateString()}`
      }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { message: "Deadline extended successfully" });
  }),
  rejectExtensionInProjectDeadline: asyncHandler(async (req, res) => {
    const { projectSlug } = req.params;
    if (!projectSlug) throw { status: BADREQUESTCODE, message: "Project slug is required." };
    await db.project.update({
      where: { projectSlug: projectSlug },
      data: {
        requestExtensionInDeadline: null,
        projectBannerMessage: "Deadline extension rejected!"
      }
    });
    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, { message: "Deadline extension rejected!" });
  })
};
