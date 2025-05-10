import express from "express";
import cors from "cors";
import { pinRoute } from "./routes/pin/pinRoute";
import { geometryRoute } from "./routes/geometry/geometryRoute";

export const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', pinRoute);
app.use('/api', geometryRoute);