import { Polygon } from "./Polygon";

export type Grid = GridPolygon[]
export type GridPolygon = {polygon: Polygon, isValid:boolean}