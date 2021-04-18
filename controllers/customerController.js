const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Ads = require("../models/taskerAdsModel");

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
      return res
        .status(400)
        .json({ msg: "تم ارسال طلبك مسبقا .. الرجاء انتظار موافقه العامل" });

    const foundConnection = tasker.connections.some(
      (el) => el.uid === req.user
    );
    if (foundConnection)
      return res.status(400).json({ msg: "هذا العامل ضمن شبكتك بالفعل." });

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

    res.json({ msg: "تم ارسال طلبك .. انتظر موافقه العامل في اقرب وقت" });
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

exports.get_all_categories = async function (req, res) {
  try {
    const category = await Category.find();
    res.json(category);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
exports.get_all_from_category = async function (req, res) {
  try {
    const ads = await Ads.find({ catId: req.params.catId });
    res.json(ads);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
exports.add_commnet = async function (req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "All fields are required" });
    //================================================================
    const ad = await Ads.findOne({
      _id: req.params.adsId,
    });
    if (!ad) return res.status(400).json({ msg: "No ad found" });

    //get username
    const user = await User.findById(req.user);
    //================================================================
    const comment = { username: user.displayName, text };
    ad.comments.push(comment);
    ad.save();
    //================================================================
    res.json(ad);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
exports.get_single_ad = async function (req, res) {
  try {
    const ad = await Ads.findOne({
      _id: req.params.adsId,
    });
    if (!ad) return res.status(400).json({ msg: "No ad found" });
    res.json(ad);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.rate = async function (req, res) {
  try {
    const { rate } = req.body;
    if (!rate) return res.status(400).json({ msg: "enter a rate" });
    //================================================================
    //get users
    const tasker = await User.findById(req.params.taskerId);
    //================================================================
    const customeRating = { rate };
    tasker.rating.push(customeRating);
    tasker.save();
    //================================================================
    res.json(tasker.rating);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.get_tasker_info = async function (req, res) {
  try {
    const tasker = await User.findById(req.params.taskerId);
    res.json({
      tasker: {
        name: tasker.displayName,
        finishedTasks: tasker.doneTasks.length,
        rating: tasker.rating,
        lastLogin: tasker.lastLogin,
        createdAt: tasker.createdAt,

        //TODO get the created date
      },
    });
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.delete_notification = async function (req, res) {
  try {
    const user = await User.findById(req.user);

    // const pushNotification = { text, type: "rate", taskerId };
    user.notification.pull({ _id: req.params.notificationId });
    user.save();
    res.json(user.notification);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.lastLogin = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(400).json({ msg: " username not found" });
    //updating the ticket status
    await user.updateOne({ lastLogin: Date.now() });

    res.json({ msg: "updated succesfully" });
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
// exports.noti = async function (req, res) {
//   try {
//     const tasker = await User.findById(req.params.taskerId);
//     const customer = await User.findById(req.user);

//     const taskerName = tasker.displayName;
//     //================================================================
//     const text = `please rate ${taskerName}`;
//     //================================================================
//     const taskerId = tasker._id.valueOf().toString();
//     //================================================================
//     const pushNotification = { text, type: "rate", taskerId };
//     customer.notification.push(pushNotification);
//     customer.save();
//     //================================================================
//     res.json(customer);
//   } catch (err) {
//     res.status(404).json({ msg: err.message });
//   }
// };
