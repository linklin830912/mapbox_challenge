import express, { Request, Response } from "express";
import { adjustGridInfo, getInitGridInfo } from "../../controller/geometryController";

export const geometryRoute = express.Router();
geometryRoute.post("/gridinfo", (req: Request, res: Response) => {
    const polygon = req.body.polygon;
    if(polygon.length<3)res.json({ error: "polygon must have more than 2 points" });
    const gridX = req.body.gridX;
    const gridY = req.body.gridY;
    const rotate = req.body.rotate;
    const shiftX = req.body.shiftX;
    const shiftY = req.body.shiftY;
    const gridinfo = getInitGridInfo(polygon, gridX, gridY, { rotate, shiftX, shiftY });
    res.json({ gridinfo });
});

geometryRoute.post("/adjustgridinfo", (req: Request, res: Response) => {
  const gridinfo = req.body.gridinfo;
  const rotate = req.body.rotate;
  const shiftX = req.body.shiftX;
  const shiftY = req.body.shiftY;
  const newGridinfo = adjustGridInfo(gridinfo, {rotate, shiftX, shiftY});
  res.json({ gridinfo: newGridinfo});
});
  