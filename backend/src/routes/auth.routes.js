import { Router } from "express";
import { check, login, logout, register } from "../controllers/auth.controller.js";

const authRoutes =  Router();

authRoutes.post("/register",register)
authRoutes.post("/login",login)
authRoutes.post("/logout",logout)
authRoutes.get("/check",check)
export default authRoutes