import { Polygon } from "./Polygon"
import { Point } from "./Point"
import { Grid } from "./Grid"

export type GridInfo = {
    convexHull: Polygon,
    grid: Grid,
    points: Point[][],
    angle: number,
    center: Point,
    polygon: Polygon,
    gridX: number,
    gridY: number,
    bbx: Polygon
}

export type AdjustGridInfo =  Omit<GridInfo, 'grid' | 'points'>;