import { Router } from "express";
import { getAllMembers } from "../controller/member.controller.js";
import { getAllPubIdsOfFolder } from "../controller/cloud.controller.js";

const PublicRouter = Router();

// Route zum einloggen
PublicRouter.route('/members')
    .get(getAllMembers);

PublicRouter.route('/cloud')
    .get(getAllPubIdsOfFolder);


export default PublicRouter