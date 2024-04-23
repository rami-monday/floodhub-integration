import { Router } from "express";
import remoteOptionsRouter from "./remote-options/remote-options.route";
import actionsRouter from "./actions/actions.route";

const router = Router();

router.use("/remote-options", remoteOptionsRouter);
router.use("/actions", actionsRouter);

export default router;
