import express from "express";
import {
    warnUser,
    unWarnUser,
    unWarnSelf,
    activateCode,
} from "../controllers/punishmentController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/warn/:id", protectRoute, warnUser);
router.get("/unwarn/:id", protectRoute, unWarnUser);
router.get("/unwarn", protectRoute, unWarnSelf);
router.get("/activate/:code", protectRoute, activateCode);

export default router;
