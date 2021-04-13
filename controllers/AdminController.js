const Ticket = require("../models/taskModel");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.get_all_tickets_by_admin = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //if the user is an admin return back all the tickets
    const tickets = await Ticket.find({ active: true });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.change_ticket_status_by_admin = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin
    if (user.role != "admin")
      return res.status(400).json({ msg: "Unauthorized" });
    //if the user is an admin they can edit ticket status
    const ticket = await Ticket.findOne({
      _id: req.params.id,
    });

    //check if the ticket exists
    if (!ticket) return res.status(400).json({ msg: "No ticket found" });

    //updating the ticket status
    await ticket.updateOne({ status: req.body.status });
    const updated = await Ticket.findOne({
      _id: req.params.id,
    });
    res.json(updated.status);
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};

exports.bun_customers_by_admin = async function (req, res) {
  try {
    const user = await User.findById(req.user);
    //checking if this user is an admin or super admin
    if (user.role === "admin" || user.role === "super admin") {
      //find the customer
      const customer = await User.findOne({
        _id: req.params.id,
      });
      if (!customer) return res.status(400).json({ msg: "customer not found" });

      //check if the user is a super admin or admin and dont allow ban.
      if (customer.role === "super admin" || customer.role === "admin")
        return res.status(400).json({
          msg:
            "Failed.. This user has a role that is equal or higher than you ",
        });

      await customer.updateOne({ active: false }); // ban the user

      const updatedAccount = await User.findOne({
        _id: req.params.id,
      });

      //find the ticket
      const ticket = await Ticket.findOne({
        _id: req.params.ticketId,
      });

      //check if the ticket exists
      if (!ticket) return res.status(400).json({ msg: "ticket not found" });

      //deactivate the ticket
      await ticket.updateOne({ active: false });

      //return the updated ticket
      const updatedTicket = await Ticket.findOne({
        _id: req.params.ticketId,
      });
      res.json({
        activeStatus: updatedAccount.active,
        activeTicketStatus: updatedTicket.active,
      });
    } else {
      return res.status(400).json({ msg: "Unauthorized" });
    }
  } catch (err) {
    res.status(404).json({ msg: "Not found 404" });
  }
};
