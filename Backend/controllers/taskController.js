const Task = require("../models/Task.js");
const { taskSchema, updateTaskSchema } = require("../utils/validators.js");

// GET /api/tasks?projectId=123
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "projectId is required",
      });
    }

    let filter = { projectId };

    // MEMBER => only own tasks
    if (req.user.role === "MEMBER") {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



// @desc    Create and delegate a task to a team member
// @route   POST /api/tasks
// @access  Protected (Admin/Manager Only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo,
      status: "todo",
      assignedBy: req.user._id,
    });

    const populatedTask = await task.populate(
      "assignedTo",
      "name email role"
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { error } = updateTaskSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
