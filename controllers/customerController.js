const Task = require("../models/taskModel");
const User = require("../models/userModel");

exports.add_connection = async function (req, res) {
  try {
    const tasker = await User.findById(req.params.taskerId);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });
    const customer = await User.findById(req.user);
    if (!customer) return res.status(400).json({ msg: "customer not found" });

    //================================================================
    const taskerId = tasker._id.valueOf().toString();
    const customerId = customer._id.valueOf().toString();
    //================================================================

    //check if connection is pending
    const foundPending = tasker.pendingConnections.some(
      (el) => el.uid === req.user
    );
    if (foundPending)
      return res.status(400).json({ msg: "your requser is already pending" });

    const foundConnection = tasker.connections.some(
      (el) => el.uid === req.user
    );
    if (foundConnection)
      return res.status(400).json({ msg: "you already have connection" });

    //adding connection
    await tasker.updateOne({
      $push: {
        pendingConnections: { name: customer.displayName, uid: customerId },
      },
    });
    await customer.updateOne({
      $push: {
        pendingConnections: { name: tasker.displayName, uid: taskerId },
      },
    });

    const updated = await User.findOne({
      _id: req.params.taskerId,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.get_tasker_tasks_by_customer = async function (req, res) {
  try {
    //find tasker
    const tasker = await User.findById(req.params.taskerId);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    const tasks = await Task.find({ taskerId: req.params.taskerId });
    res.json(tasks);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};

exports.add_task = async function (req, res) {
  try {
    const { title, Location, date } = req.body;
    //validation
    if (!title || !Location)
      return res.status(400).json({ msg: "All the fields are required" });

    //get the username
    const user = await User.findById(req.user);

    //save the task
    const newTask = new Task({
      title,
      Location,
      taskerId: req.params.taskerId,
      CustomerName: user.displayName,
      CustomerId: req.user,
    });
    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
