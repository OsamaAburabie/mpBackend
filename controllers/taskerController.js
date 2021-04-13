const Task = require("../models/taskModel");
const User = require("../models/userModel");

exports.accept_connection = async function (req, res) {
  try {
    const { uid } = req.body;
    if (!uid)
      return res.status(400).json({ msg: "All the fields are required" });

    const tasker = await User.findById(req.user);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    const customer = await User.findById(uid);
    if (!customer) return res.status(400).json({ msg: "customer not found" });

    //================================================================ id's
    const taskerId = tasker._id.valueOf().toString();
    const customerId = customer._id.valueOf().toString();
    //================================================================

    //find the tasker pending customer
    const foundTasker = customer.pendingConnections.find(
      (el) => el.uid === taskerId
    );
    if (!foundTasker) return res.status(400).json({ msg: "Tasker not found" });

    //find the customer tasker
    const foundCustomer = tasker.pendingConnections.find(
      (el) => el.uid === customerId
    );
    if (!foundCustomer)
      return res.status(400).json({ msg: "Customer not found" });

    //adding connection
    await tasker.updateOne({
      $pull: {
        pendingConnections: foundCustomer,
      },
      $push: {
        connections: foundCustomer,
      },
    });

    await customer.updateOne({
      $pull: {
        pendingConnections: foundTasker,
      },
      $push: {
        connections: foundTasker,
      },
    });

    const updated = await User.findOne({
      _id: req.user,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete_specific_task = async function (req, res) {
  try {
    const task = await Task.findOne({
      userId: req.user,
      _id: req.params.id,
    });
    if (!task) return res.status(400).json({ msg: "No task found" });
    const deleteTask = await Task.findByIdAndDelete(req.params.id);
    res.json(deleteTask);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};
exports.send_message = async function (req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "All fields are required" });
    //================================================================
    const task = await Task.findOne({
      _id: req.params.id,
    });
    if (!task) return res.status(400).json({ msg: "No task found" });

    if (task.CustomerId !== req.user)
      return res.status(400).json({ msg: "this task does not belong to you!" });

    //get username
    const user = await User.findById(req.user);
    //================================================================
    const message = { username: user.displayName, text };
    task.messages.push(message);
    task.save();
    //================================================================
    res.json(task);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.get_all_tasks_for_tasker = async function (req, res) {
  try {
    const tasks = await Task.find({ taskerId: req.user });
    res.json(tasks);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};
