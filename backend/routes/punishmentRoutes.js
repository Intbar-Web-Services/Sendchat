import express from "express";
import {
    warnUser,
    unWarnUser,
    unWarnSelf,
    demoteSelf,
    unsuspendSelf,
    banUser,
    suspendUser,
    activateCode,
} from "../controllers/punishmentController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { punishmentCheck } from "../server.js";

const router = express.Router();

router.post("/warn/:id", protectRoute, warnUser);
router.post("/suspend/:id", protectRoute, suspendUser);
router.get("/unwarn/:id", protectRoute, unWarnUser);
router.get("/demoteself", protectRoute, demoteSelf);
router.get("/unwarn", protectRoute, unWarnSelf);
router.get("/unsuspend", protectRoute, unsuspendSelf);
router.get("/activate/:code", protectRoute, punishmentCheck, activateCode);
router.post("/ban/:id", protectRoute, banUser);

export default router;
