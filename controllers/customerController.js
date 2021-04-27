const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Category = require("../models/categoryModel");
const Ads = require("../models/taskerAdsModel");
const { PageviewTwoTone } = require("@material-ui/icons");

// exports.add_connection_old = async function (req, res) {
//   try {
//     const tasker = await User.findById(req.params.taskerId);
//     if (!tasker) return res.status(400).json({ msg: "tasker not found" });
//     const customer = await User.findById(req.user);
//     if (!customer) return res.status(400).json({ msg: "customer not found" });

//     //================================================================
//     const taskerId = tasker._id.valueOf().toString();
//     const customerId = customer._id.valueOf().toString();
//     //================================================================

//     //check if connection is pending
//     const foundPending = tasker.pendingConnections.some(
//       (el) => el.uid === req.user
//     );
//     if (foundPending)
//       return res
//         .status(400)
//         .json({ msg: "تم ارسال طلبك مسبقا .. الرجاء انتظار موافقه العامل" });

//     const foundConnection = tasker.connections.some(
//       (el) => el.uid === req.user
//     );
//     if (foundConnection)
//       return res.status(400).json({ msg: "هذا العامل ضمن شبكتك بالفعل." });

//     //adding connection
//     // await tasker.updateOne({
//     //   $push: {
//     //     pendingConnections: { name: customer.displayName, uid: customerId },
//     //   },
//     // });

//     tasker.pendingConnections.push({
//       name: customer.displayName,
//       uid: customerId,
//     });
//     tasker.save();

//     customer.pendingConnections.push({
//       name: tasker.displayName,
//       uid: taskerId,
//     });
//     customer.save();

//     // await customer.updateOne({
//     //   $push: {
//     //     pendingConnections: { name: tasker.displayName, uid: taskerId },
//     //   },
//     // });

//     res.json({ msg: "تم ارسال طلبك .. انتظر موافقه العامل في اقرب وقت" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.add_connection = async function (req, res) {
  try {
    const { title, location, desc } = req.body;
    //validation
    if (!title || !location)
      return res.status(400).json({ msg: "الرجاء ادخال الحقول المطلوبه" });

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
    //=================================================================
    const newTask = new Task({
      title,
      location,
      desc,
      taskerId: req.params.taskerId,
      CustomerName: customer.displayName,
      CustomerId: req.user,
    });
    const savedTask = await newTask.save();
    //=================================================================
    const taskId = savedTask._id.valueOf().toString();
    //=================================================================

    await tasker.pendingConnections.push({
      name: customer.displayName,
      uid: customerId,
      taskTitle: savedTask.title,
      taskDesc: savedTask.desc,
      taskLocation: savedTask.location,
      taskId,
    });
    await tasker.save();

    await customer.pendingConnections.push({
      name: tasker.displayName,
      uid: taskerId,
      taskId,
    });
    await customer.save();

    res.json({
      savedTask,
      taskerPen: tasker.pendingConnections,
      customerPen: customer.pendingConnections,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get_tasker_tasks_by_customer = async function (req, res) {
  try {
    //find tasker
    const tasker = await User.findById(req.params.taskerId);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    const tasks = await Task.find({
      taskerId: req.params.taskerId,
      status: "pending",
    });
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
  const PAGE_SIZE = 7;
  const total = await Ads.countDocuments({ catId: req.params.catId });
  const page = parseInt(req.query.page || 0);
  try {
    const ads = await Ads.find({ catId: req.params.catId })
      .limit(PAGE_SIZE)
      .skip(PAGE_SIZE * page);

    res.json({
      totalPages: Math.ceil(total / PAGE_SIZE),
      ads,
    });
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

exports.rate_old = async function (req, res) {
  try {
    const { rate } = req.body;
    if (!rate) return res.status(400).json({ msg: "enter a rate" });
    //================================================================
    const tasker = await User.findById(req.params.taskerId);
    const user = await User.findById(req.user);
    //================================================================
    const taskerId = tasker._id.valueOf().toString();
    //================================================================

    const customeRating = { rate };
    tasker.rating.push(customeRating);
    tasker.save();
    //================================================================
    user.notification.pull({ _id: req.params.notifId });
    user.save();
    // res.json("done");
    res.json(user);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.rate = async function (req, res) {
  try {
    const { rate } = req.body;
    if (!rate) return res.status(400).json({ msg: "enter a rate" });
    //================================================================
    const task = await Task.findOne({
      CustomerId: req.user,
      _id: req.params.taskId,
    });

    if (!task)
      return res
        .status(400)
        .json({ msg: "This task is deleted or dosent belong to you" });

    if (task.rated === true)
      return res.status(400).json({ msg: "This task is already rated" });

    //TODO check for status

    const tasker = await User.findById(task.taskerId);
    const customer = await User.findById(task.CustomerId);
    //================================================================
    const taskerId = tasker._id.valueOf().toString();
    //================================================================
    const customeRating = { rate };
    await tasker.rating.push(customeRating);
    await tasker.save();
    //================================================================
    await customer.notification.pull({ _id: req.params.notifId });
    await customer.save();

    await task.updateOne({ rated: true });

    res.json("done");
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.get_tasker_info = async function (req, res) {
  try {
    const tasker = await User.findById(req.params.taskerId);
    if (!tasker) return res.status(400).json({ msg: "No tasker found" });
    //==========================================================
    const resutl = tasker.rating.map((el) => el).length;
    let sum = 0;
    tasker.rating.map(myFunction);

    function myFunction(obj) {
      sum += obj["rate"] / resutl;
    }
    //==========================================================

    res.json({
      tasker: {
        name: tasker.displayName,
        img: tasker.img,
        finishedTasks: tasker.doneTasks.length,
        rating: {
          sum,
          numOfVotes: resutl,
        },
        lastLogin: tasker.lastLogin,
        createdAt: tasker.createdAt,
      },
    });
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
exports.get_tasker_rating = async function (req, res) {
  try {
    const tasker = await User.findById(req.params.taskerId);
    if (!tasker) return res.status(400).json({ msg: "No tasker found" });

    //==========================================================
    const resutl = tasker.rating.map((el) => el).length;
    let sum = 0;
    tasker.rating.map(myFunction);

    function myFunction(obj) {
      sum += obj["rate"] / resutl;
    }
    //==========================================================

    res.json(sum);
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.update_notification = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    // console.log(user.notification);
    const filterd = user.notification.filter(
      (el) => el.notifId === req.params.notificationId
    );

    filterd[0].seen = 1;
    user.save();

    // user.notification.pull({ _id: req.params.notificationId });
    // res.json("done");
    res.json("done");
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
exports.delete_notification = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    user.notification.pull({ _id: req.params.notificationId });
    await user.save();
    res.json("done");
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

exports.delete_specific_task_by_customer = async function (req, res) {
  try {
    const task = await Task.findOne({
      CustomerId: req.user,
      _id: req.params.id,
    });
    if (!task)
      return res
        .status(400)
        .json({ msg: "This task is deleted or dosent belong to you" });
    //================================================================ id's
    const taskerId = task.taskerId;
    const customerId = task.CustomerId;
    //================================================================
    const tasker = await User.findById(taskerId);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    const customer = await User.findById(customerId);
    if (!customer) return res.status(400).json({ msg: "customer not found" });
    //================================================================
    //find the tasker pending customer
    const foundTasker = customer.connections.find((el) => el.uid === taskerId);
    if (!foundTasker)
      return res.status(400).json({ msg: "Tasker can not be found" });

    //find the customer tasker
    const foundCustomer = tasker.connections.find(
      (el) => el.uid === customerId
    );

    if (!foundCustomer)
      return res.status(400).json({ msg: "Customer not found" });
    //=======================================================================
    await tasker.connections.pull(foundCustomer);
    await tasker.save();

    await customer.connections.pull(foundTasker);
    await customer.save();
    //=======================================================================

    //deleted the task
    await Task.findByIdAndDelete(req.params.id);
    res.json("done");
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
