const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");

exports.add_ticket = async function (req, res) {
  try {
    const { title, body, email } = req.body;
    //validation
    if (!title || !body || !email)
      return res.status(400).json({ msg: "All the fields are required" });

    //check if the user is banned
    const user = await User.findById(req.user);
    if (user.active === false)
      return res
        .status(400)
        .json({ msg: "This account has been banned by the admin" });

    //save the ticket
    const newTicket = new Ticket({
      title,
      body,
      email,
      userId: req.user,
    });
    const savedTicket = await newTicket.save();
    res.json(savedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//get all tickets for this user id
exports.get_all_tickets = async function (req, res) {
  try {
    const tickets = await Ticket.find({ userId: req.user });
    res.json(tickets);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};

//delete tickets for this user id only
exports.delete_specific_ticket = async function (req, res) {
  try {
    const ticket = await Ticket.findOne({
      userId: req.user,
      _id: req.params.id,
    });
    if (!ticket) return res.status(400).json({ msg: "No ticket found" });
    const deleteTicket = await Ticket.findByIdAndDelete(req.params.id);
    res.json(deleteTicket);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};

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

exports.get_tasker_todos_by_customer = async function (req, res) {
  try {
    //find tasker
    const tasker = await User.findById(req.params.taskerId);

    //validation
    if (!tasker) return res.status(400).json({ msg: "tasker not found" });

    //check if there is a connection
    const found = tasker.connections.find((el) => el.uid === req.user);
    if (!found) return res.status(400).json({ msg: "you have no connection" });

    const tickets = await Ticket.find({ userId: req.params.taskerId });
    res.json(tickets);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};
