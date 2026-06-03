const express = require('express');
const projectRouter = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware.js');
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController.js');

// All project routes require authentication
projectRouter.use(protect);

projectRouter.route('/')
  .get(getProjects)
  // Admin/Manager only
  .post(restrictTo('ADMIN', 'MANAGER'), createProject);

projectRouter.route('/:id')
  // Admin/Manager only
  .put(restrictTo('ADMIN', 'MANAGER'), updateProject)
  // Admin only
  .delete(restrictTo('ADMIN'), deleteProject);

module.exports = projectRouter;