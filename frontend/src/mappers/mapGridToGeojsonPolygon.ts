import { Grid } from "../models/Grid";

export function mapGridToGeojsonPolygon(grid: Grid):[number, number][][] {
    return grid.map((poly)=>poly.map(point=>[point.x, point.y]))
 }