const express = require('express');
const taskRouter = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware.js');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController.js');

// All task routes require authentication
taskRouter.use(protect);

taskRouter.route('/')
  .get(getTasks)
  .post(createTask); // Assuming any member can create a task, adjust if strictly managers

taskRouter.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

  // Only ADMIN and MANAGER ranks can dispatch post requests to create tasks
taskRouter.post('/', restrictTo('ADMIN', 'MANAGER'), createTask);

module.exports = taskRouter;