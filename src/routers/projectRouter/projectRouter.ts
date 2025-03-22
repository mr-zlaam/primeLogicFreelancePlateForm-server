import { Router } from "express";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import { projectSchema } from "../../validation/zod";
import projectController from "../../controllers/projectController/projectController";
import updateProjectController from "../../controllers/projectController/updateProjectController";
import authMiddleware from "../../middlewares/authMiddleware";
import getProjectController from "../../controllers/projectController/getProjectController";
export const projectRouter = Router();

projectRouter
  .route("/createProject")
  .post(
    validateDataMiddleware(projectSchema),
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    projectController.createProject
  );
projectRouter
  .route("/getSingleProject/:projectSlug")
  .get(authMiddleware.checkToken, authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer, projectController.getSingleProject);

projectRouter
  .route("/getAllOutsourcedProjects")
  .get(authMiddleware.checkToken, authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer, getProjectController.getAllOutsourcedProjects);
projectRouter
  .route("/getAllProjects")
  .get(authMiddleware.checkToken, authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer, getProjectController.getAllProjects);
projectRouter.route("/getAllProjectsWithThierClient/:clientId").get(authMiddleware.checkToken, getProjectController.getAllProjectsWithThierClient);
projectRouter.route("/deleteProject/:id").delete(authMiddleware.checkToken, authMiddleware.checkIfUserIsAdmin, projectController.deleteProject);

projectRouter
  .route("/getProjectForSelectedFreelancers")
  .get(authMiddleware.checkToken, authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer, getProjectController.getProjectForSelectedFreelancers);
// *************************Update Project Details

projectRouter
  .route("/createInterestedFreelancers/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer, updateProjectController.createInterestedFreelancers);

projectRouter
  .route("/removeFreelancerFromInterestedList/:projectSlug")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
    updateProjectController.removeFreelancerFromInterestedList
  );

projectRouter
  .route("/listInterestedFreelancersInSingleProject/:projectSlug")
  .get(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.listInterestedFreelancersInSingleProject);

projectRouter
  .route("/selectFreelancerForProject/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.selectFreelancerForProject);

projectRouter
  .route("/removeSelectedFreelancer/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.removeSelectedFreelancer);

projectRouter.route("/updateProgressOfProject/:projectSlug").patch(
  //  authMiddleware.checkIfUserIAdminOrModerator,
  updateProjectController.updateProgressOfProject
);

projectRouter
  .route("/changeProjectStatus/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.changeProjectStatus);

projectRouter
  .route("/changeProjectType/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.changeProjectType);
projectRouter
  .route("/writeReviewAndGiveRating/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.writeReviewAndGiveRating);

projectRouter
  .route("/updateProjectBySlug/:projectSlug")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    validateDataMiddleware(projectSchema),
    updateProjectController.updateProjectBySlug
  );
projectRouter
  .route("/makeProjectOutsource/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.makeProjectOutsource);

projectRouter
  .route("/makeProjectOutsource/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.makeProjectOutsource);

projectRouter
  .route("/acceptExtensionInProjectDeadline/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.acceptExtensionInProjectDeadline);

projectRouter
  .route("/rejectExtensionInProjectDeadline/:projectSlug")
  .patch(authMiddleware.checkToken, authMiddleware.checkIfUserIAdminOrModerator, updateProjectController.rejectExtensionInProjectDeadline);
