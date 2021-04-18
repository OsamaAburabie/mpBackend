const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Ads = require("../models/taskerAdsModel");
const { v4: uuidv4 } = require("uuid");

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

    const taskerName = tasker.displayName;

    const text = `لقد اضافك ${taskerName} الى شبكته .. تواصل معه الاَن`;

    const pushNotification = {
      text,
      type: "connection",
      taskerId,
      notifId: uuidv4(),
    };

    customer.notification.push(pushNotification);
    customer.save();

    tasker.doneTasks.push({ taskId });
    tasker.save();

    const updated = await User.findOne({
      _id: req.user,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.reject_connection = async function (req, res) {
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
    });

    await customer.updateOne({
      $pull: {
        pendingConnections: foundTasker,
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

exports.makeAd = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "tasker")
      return res.status(400).json({ msg: "you're not a tasker" });
    //================================
    const { title, desc, price, location } = req.body;
    //================================

    const newAd = await Ads({
      title,
      desc,
      price,
      location,
      taskerInfo: {
        name: user.displayName,
        uid: user._id,
      },
      catId: req.params.catId,
    });
    const ad = await newAd.save();
    res.json(ad);
  } catch (err) {
    res.status(404).json({ msg: err.message });
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
exports.mark_as_done = async function (req, res) {
  try {
    const tasker = await User.findById(req.user);
    //checking if this user is an admin
    if (tasker.role != "tasker")
      return res.status(400).json({ msg: "Unauthorized" });
    //if the user is an admin they can edit ticket status
    const task = await Task.findOne({
      _id: req.params.id,
    });
    //check if the task exists
    if (!task) return res.status(400).json({ msg: "No task found" });

    //get customer id
    const customerId = task.CustomerId;
    const taskId = task._id;
    //find the customer
    const customer = await User.findById(customerId);
    //===============================

    const taskerName = tasker.displayName;

    const text = `من فضلك قم بتقييم العامل ${taskerName}`;

    const taskerId = tasker._id.valueOf().toString();

    const pushNotification = {
      text,
      type: "rate",
      taskerId,
      notifId: uuidv4(),
    };
    customer.notification.push(pushNotification);
    customer.save();

    tasker.doneTasks.push({ taskId });
    tasker.save();
    //updating the ticket status
    await task.updateOne({ status: "done" });
    const updated = await Task.findOne({
      _id: req.params.id,
    });
    res.json(updated.status);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
