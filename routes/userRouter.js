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
  add_commnet,
  add_task,
  get_all_from_category,
  get_all_categories,
  get_single_ad,
  rate,
  get_tasker_info,
  get_tasker_rating,
  update_notification,
  delete_notification,
  lastLogin,
  delete_specific_task_by_customer,
} = require("../controllers/customerController");
//================================================================
const {
  get_all_tasks_for_tasker,
  delete_specific_task,
  accept_connection,
  accept_connection_new,
  reject_connection,
  send_message,
  makeAd,
  mark_as_done,
  change_task,
} = require("../controllers/taskerController");
//================================================================
router.post("/register", user_register);
router.post("/login", user_login);
router.delete("/delete", auth, delete_user_account);
//================================================================================= customer handlers
router.post("/addTask/:taskerId", auth, connection, add_task);
router.post("/addConnection/:taskerId", auth, add_connection);
router.get(
  "/getTaskerTodos/:taskerId",
  auth,
  connection,
  get_tasker_tasks_by_customer
);
router.get("/getallfromCategory/:catId", get_all_from_category);
router.get("/getallCategories", get_all_categories);
router.get("/getSingleAd/:adsId", get_single_ad);
router.post("/addComment/:adsId", auth, add_commnet);
// router.post("/rate/:taskerId/:notifId", auth, connection, rate);
router.post("/rate/:taskId/:notifId", auth, rate);
router.get("/taskerInfo/:taskerId", get_tasker_info);
router.get("/taskerRating/:taskerId", get_tasker_rating);
router.put("/updateNotification/:notificationId", auth, update_notification);
router.post("/deleteNotification/:notificationId", auth, delete_notification);
router.delete("/deleteMyTask/:id", auth, delete_specific_task_by_customer);
//================================================================================= tasker handlers
router.post("/acceptConnection", auth, accept_connection);
router.post("/rejectConnection", auth, reject_connection);
router.get("/myTasks", auth, get_all_tasks_for_tasker);
router.put("/doneTask/:id", auth, mark_as_done);
router.put("/editTask/:id", auth, change_task);
router.post("/newpost/:catId", auth, makeAd);
//================================================================================= global handlers
router.post("/sendMessage/:id/:taskerId", auth, send_message);
router.put("/lastLogin", auth, lastLogin);

module.exports = router;
