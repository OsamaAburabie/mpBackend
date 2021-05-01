const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  add__category,
  edit__category,
  single_category,
} = require("../controllers/adminController");
const multer = require("multer");

router
  .route("/addCategory")
  .post(
    multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
      "img"
    ),
    auth,
    add__category
  );
router
  .route("/editCategory/:catId")
  .put(
    multer({ dest: "temp/", limits: { fieldSize: 8 * 1024 * 1024 } }).single(
      "img"
    ),
    auth,
    edit__category
  );

router.get("/singleCategory/:catId", single_category);
// router.get("/allTickets", auth, get_all_tickets_by_admin);

// router.put("/allTickets/:id", auth, change_ticket_status_by_admin);

// router.put("/ban/:id/:ticketId", auth, bun_customers_by_admin);

// //TODO
// router.get("/allAdmins", auth, get_all_admins_by_super_admim);

// router.put("/allAdmins/:id", auth, change_role_by_super_admin);

module.exports = router;
