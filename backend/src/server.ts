// backend/src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import { adjustGridInfo, getGridInfoFromPolygon} from "./utils/geoHelper";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/message", (req: Request, res: Response) => {
  res.json({ message: "Hello from server backend!" });
});

// app.post("/api/polygon", (req: Request, res: Response) => {
//   const polygon = req.body.polygon
//   const grid = getConvexHull(polygon);
//   res.json({ grid });
// });

// app.post("/api/gridPoints", (req: Request, res: Response) => {
//   const polygon = req.body.polygon;
//   const gridX = req.body.gridX;
//   const gridY = req.body.gridY;
//   const gridPoints = getGridPointsFromPolygon(polygon, gridX, gridY);
//   res.json({ gridPoints });
// });

// app.post("/api/grid", (req: Request, res: Response) => {
//   const polygon = req.body.polygon;
//   const gridX = req.body.gridX;
//   const gridY = req.body.gridY;
//   const grid = getGridFromPolygon(polygon, gridX, gridY);
//   res.json({ grid });
// });

app.post("/api/gridinfo", (req: Request, res: Response) => {
  const polygon = req.body.polygon;
  const gridX = req.body.gridX;
  const gridY = req.body.gridY;
  const rotate = req.body.rotate;
  const shiftX = req.body.shiftX;
  const shiftY = req.body.shiftY;
  const gridinfo = getGridInfoFromPolygon(polygon, gridX, gridY, rotate, shiftX, shiftY);
  res.json({ gridinfo });
});

app.post("/api/adjustgridinfo", (req: Request, res: Response) => {
  const gridinfo = req.body.gridinfo;
  const rotate = req.body.rotate;
  const shiftX = req.body.shiftX;
  const shiftY = req.body.shiftY;
  const newGridinfo = adjustGridInfo(gridinfo, rotate, shiftX, shiftY);
  res.json({ gridinfo: newGridinfo});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
