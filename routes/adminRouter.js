const router = require("express").Router();
const auth = require("../middleware/auth");
const { add__category } = require("../controllers/adminController");

router.post("/addCategory", auth, add__category);

// router.get("/allTickets", auth, get_all_tickets_by_admin);

// router.put("/allTickets/:id", auth, change_ticket_status_by_admin);

// router.put("/ban/:id/:ticketId", auth, bun_customers_by_admin);

// //TODO
// router.get("/allAdmins", auth, get_all_admins_by_super_admim);

// router.put("/allAdmins/:id", auth, change_role_by_super_admin);

module.exports = router;
