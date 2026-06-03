const Joi = require('joi');

const projectSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().allow('', null).optional()
  // teamId will be extracted securely from req.user
});

const taskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow('', null).optional(),
  projectId: Joi.string().required(), // Expecting a MongoDB ObjectId string
  assignedTo: Joi.string().allow(null).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional()
});

const messageSchema = Joi.object({
  content: Joi.string().trim().min(1).required(),
  teamId: Joi.string().required() 
});


const updateTaskSchema = Joi.object({
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
  assignedTo: Joi.string().allow(null).optional()
});


module.exports = { projectSchema, taskSchema, updateTaskSchema, messageSchema };