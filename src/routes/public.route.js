import { Router } from "express";
import { getAllMembers } from "../controller/member.controller.js";

const PublicRouter = Router();

// Route zum einloggen
PublicRouter.route('/members')
    .get(getAllMembers);


export default PublicRouter