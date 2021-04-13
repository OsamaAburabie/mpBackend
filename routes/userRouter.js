const router = require("express").Router();
const auth = require("../middleware/auth");
const connection = require("../middleware/connection");

//================================================================
const {
  user_register,
  user_login,
  delete_user_account,
} = require("../controllers/authController");
//================================================================
const {
  get_tasker_tasks_by_customer,
  add_connection,
  add_task,
} = require("../controllers/customerController");
//================================================================
const {
  get_all_tasks_for_tasker,
  delete_specific_task,
  accept_connection,
  send_message,
} = require("../controllers/taskerController");
//================================================================

//@@ All the handlers are in the controllers folder
router.post("/register", user_register);
router.post("/login", user_login);
router.delete("/delete", auth, delete_user_account);
//================================================================================= customer handlers
router.post("/addTickets/:taskerId", auth, connection, add_task);
router.post("/addConnection/:taskerId", auth, add_connection);
router.get(
  "/getTaskerTodos/:taskerId",
  auth,
  connection,
  get_tasker_tasks_by_customer
);
//================================================================================= tasker handlers
router.post("/acceptConnection", auth, accept_connection);
router.get("/myTasks", auth, get_all_tasks_for_tasker);
router.delete("/myTasks/:id", auth, delete_specific_task);
//================================================================================= global handlers
router.post("/sendMessage/:id", auth, send_message);

module.exports = router;
