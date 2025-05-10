import { Polygon } from "../geometry/Polygon"
import { Point } from "../geometry/Point"
import { Grid } from "../geometry/Grid"

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

export type AdjustGridInfo = Omit<GridInfo, 'grid' | 'points'>;

export const DEFAULT_GRID_INFO = {
    convexHull: [],
    grid: [],
    points: [],
    angle: 0,
    center: {x:0, y:0},
    polygon: [],
    gridX: 0,
    gridY: 0,
    bbx: []
} as GridInfo;