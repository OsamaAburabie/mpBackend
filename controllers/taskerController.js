const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Ads = require("../models/taskerAdsModel");
const { v4: uuidv4 } = require("uuid");

exports.accept_connection = async function (req, res) {
  try {
    const { uid, taskId } = req.body;
    if (!uid)
      return res.status(400).json({ msg: "All the fields are required" });
    if (!taskId)
      return res.status(400).json({ msg: "All the fields are required" });

    const task = await Task.findOne({
      _id: taskId,
    });
    if (!task) return res.status(400).json({ msg: "task not found" });

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

    await task.updateOne({ status: "pending" });

    await tasker.pendingConnections.pull(foundCustomer);
    await tasker.connections.push(foundCustomer);
    await tasker.save();

    await customer.pendingConnections.pull(foundTasker);
    await customer.connections.push(foundTasker);
    await customer.save();

    const taskerName = tasker.displayName;

    const text = `لقد اضافك ${taskerName} الى مهامه .. تواصل معه الاَن`;

    const pushNotification = {
      text,
      type: "connection",
      taskerId,
      notifId: uuidv4(),
    };

    customer.notification.push(pushNotification);
    customer.save();

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
    const { uid, taskId } = req.body;

    if (!uid)
      return res.status(400).json({ msg: "All the fields are required" });
    if (!taskId)
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

    await Task.findByIdAndDelete(taskId);

    //remove connection from both sides
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

// exports.delete_specific_task = async function (req, res) {
//   try {
//     const task = await Task.findOne({
//       userId: req.user,
//       _id: req.params.id,
//     });
//     if (!task) return res.status(400).json({ msg: "No task found" });
//     const deleteTask = await Task.findByIdAndDelete(req.params.id);
//     res.json(deleteTask);
//   } catch (err) {
//     res.status(404).json({ msg: "Not found 404" });
//   }
// };
exports.send_message = async function (req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "All fields are required" });
    //================================================================
    const task = await Task.findOne({
      _id: req.params.id,
    });
    if (!task) return res.status(400).json({ msg: "No task found" });

    const user = await User.findById(req.user);

    if (user.role === "customer") {
      if (task.CustomerId !== req.user)
        return res
          .status(400)
          .json({ msg: "this task does not belong to you!" });

      //get username
      const user = await User.findById(req.user);
      //================================================================
      const message = { username: user.displayName, text };
      await task.messages.push(message);
      await task.save();
      //================================================================

      const [lastItem] = await task.messages.slice(-1);
      await task.updateOne({ notification: 1 });
      res.json(lastItem);
    } else if (user.role === "tasker") {
      if (task.taskerId !== req.user)
        return res
          .status(400)
          .json({ msg: "this task does not belong to you!" });

      //get username
      const user = await User.findById(req.user);
      //================================================================
      const message = { username: user.displayName, text };
      await task.messages.push(message);
      await task.save();
      //================================================================

      const [lastItem] = await task.messages.slice(-1);

      res.json(lastItem);
    } else {
      return res.status(400).json({ msg: "unauthorized" });
    }
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.get_all_tasks_for_tasker = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    if (user.role !== "tasker")
      return res.status(400).json({ msg: "unauthorized" });

    const tasks = await Task.find({ taskerId: req.user, status: "pending" });
    res.json(tasks);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};
exports.get_single_tasks_for_tasker = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    if (user.role !== "tasker")
      return res.status(400).json({ msg: "unauthorized" });

    const tasks = await Task.find({ _id: req.params.id });
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
    if (typeof price !== "number")
      return res.status(400).json({ msg: "السعر يجب ان يكون رقما " });
    if (!title || !desc || !price || !location)
      return res.status(400).json({ msg: "الرجاء ادخل جميع الحقول " });

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
    await newAd.save();
    res.json("تم ارسال اعلانك بنجاح ");
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.delete_specific_task = async function (req, res) {
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

exports.mark_as_done = async function (req, res) {
  try {
    //if the user is an admin they can edit ticket status
    const task = await Task.findOne({
      _id: req.params.id,
    });
    //check if the task exists
    if (!task) return res.status(400).json({ msg: "No task found" });
    //================================================================ id's
    const customerId = task.CustomerId;
    //================================================================
    const tasker = await User.findById(req.user);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    //================================================================
    const taskerId = tasker._id.valueOf().toString();
    //================================================================

    const customer = await User.findById(customerId);
    if (!customer) return res.status(400).json({ msg: "customer not found" });

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

    //nottification
    const taskId = task._id;
    const taskerName = tasker.displayName;
    const text = `من فضلك قم بتقييم العامل ${taskerName}`;
    const pushNotification = {
      text,
      type: "rate",
      taskerId,
      taskId,
      notifId: uuidv4(),
    };
    //======================================================================= push rate notification to customer
    await customer.notification.push(pushNotification);
    await customer.save();
    //======================================================================= add anothed done task to tasker
    await tasker.doneTasks.push({ taskId });
    await tasker.save();
    //======================================================================= remove connections

    await tasker.connections.pull(foundCustomer);
    await tasker.save();

    await customer.connections.pull(foundTasker);
    await customer.save();
    //======================================================================
    //updating the ticket status
    await task.updateOne({ status: "done" });

    res.json("done");
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};

exports.change_task = async function (req, res) {
  try {
    //the working value is 1 or 2 1 for false and 2 for true
    const { working, menutes } = req.body;
    //if the user is an admin they can edit ticket status
    const task = await Task.findOne({
      _id: req.params.id,
    });
    //check if the task exists
    if (!task) return res.status(400).json({ msg: "No task found" });
    //================================================================ id's
    const customerId = task.CustomerId;
    //================================================================
    const tasker = await User.findById(req.user);
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    //================================================================
    const taskerId = tasker._id.valueOf().toString();
    //================================================================

    const customer = await User.findById(customerId);
    if (!customer) return res.status(400).json({ msg: "customer not found" });

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

    //nottification
    const taskId = task._id;
    const taskerName = tasker.displayName;
    const text = `${taskerName} قام بتغيير حالة مهمتك  `;
    const pushNotification = {
      text,
      type: "connection",
      taskerId,
      taskId,
      notifId: uuidv4(),
    };
    //========================================================= this function will add n number of menutes to the current date
    Date.prototype.addMinutes = function (h) {
      this.setMinutes(this.getMinutes() + h);
      return this;
    };

    //updating
    if (menutes && !working) {
      await task.updateOne({ estimatedTime: new Date().addMinutes(menutes) });
    } else if (!menutes) {
      await task.updateOne({ working: working });
    } else {
      await task.updateOne({
        working: working,
        estimatedTime: new Date().addMinutes(menutes),
      });
    }

    //======================================================================= push rate notification to customer
    await customer.notification.push(pushNotification);
    await customer.save();

    const updated = await Task.findOne({
      _id: req.params.id,
    });
    res.json({
      working: updated.working,
      estimatedTime: updated.estimatedTime,
    });
  } catch (err) {
    res.status(404).json({ msg: err.message });
  }
};
