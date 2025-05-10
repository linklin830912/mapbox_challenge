import { Grid } from "../models/Grid";
import { Point } from "../models/Point";

export function mapGridToGeojsonPolygon(grid: Grid):{polygon: [number, number][], isValid:boolean}[] {
    return grid.map((poly)=>{return { polygon: poly.polygon.map((pt: Point)=>[pt.x, pt.y]), isValid:poly.isValid}})
 }