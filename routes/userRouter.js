const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  user_register,
  user_login,
  delete_user_account,
} = require("../controllers/authController");
const {
  add_ticket,
  get_all_tickets,
  delete_specific_ticket,
  add_connection,
  get_tasker_todos_by_customer,
  accept_connection,
} = require("../controllers/ticketController");

//@@ All the handlers are in the controllers folder

router.post("/register", user_register);

router.post("/login", user_login);

router.delete("/delete", auth, delete_user_account);

router.post("/addTickets", auth, add_ticket);

router.post("/addConnection/:taskerId", auth, add_connection);

router.post("/acceptConnection", auth, accept_connection);

router.get("/getTaskerTodos/:taskerId", auth, get_tasker_todos_by_customer);

router.get("/allTickets", auth, get_all_tickets);

router.delete("/allTickets/:id", auth, delete_specific_ticket);
module.exports = router;
