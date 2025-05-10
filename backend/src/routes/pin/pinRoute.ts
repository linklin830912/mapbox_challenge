import express, { Request, Response } from "express";

export const pinRoute = express.Router();
pinRoute.get("/message", (req: Request, res: Response) => {
    res.json({ message: "Hello from server backend!" });
  });
  