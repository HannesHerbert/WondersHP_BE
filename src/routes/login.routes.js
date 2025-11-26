import { Router } from "express";
import { loginUser, validateUser } from "../controller/user.controller.js";

const LoginRouter = Router();

// Route zum einloggen
LoginRouter.route('/user')
    .post(loginUser);

LoginRouter.route('/validation')
    .post(validateUser);


export default LoginRouter