import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { registerUser, loginUser, getUserById } from "../services/auth.service";
import config from "../config";

const COOKIE_NAME = config.AUTH_COOKIE_NAME;
const COOKIE_OPTIONS = config.COOKIE_OPTIONS;

export const registerValidators = [
    body("name").isString().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
];

export async function registerController(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

    const { name, email, password } = req.body;
    try {
        const user = await registerUser(name, email, password);
        // issue token
        const { token } = await loginUser(email, password);
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS as any);
        return res.status(201).json({ token, user });
    } catch (err: any) {
        if (err.message === "EMAIL_EXISTS") return res.status(409).json({ message: "Email already registered" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const loginValidators = [body("email").isEmail(), body("password").isString().notEmpty()];

export async function loginController(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation error", errors: errors.array() });

    const { email, password } = req.body;
    try {
        const { token, user } = await loginUser(email, password);
        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS as any);
        return res.json({ token, user });
    } catch (err: any) {
        if (err.message === "INVALID_CREDENTIALS") return res.status(401).json({ message: "Invalid credentials" });
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function logoutController(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS as any);
    return res.status(204).send();
}

export async function meController(req: Request, res: Response) {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
}
