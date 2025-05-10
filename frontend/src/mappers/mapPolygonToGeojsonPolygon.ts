import { Polygon } from "../models/Polygon";

export function mapPolygonToGeojsonPolygon(polygon: Polygon):[number, number][] {
    return polygon.map((pt)=>[pt.x, pt.y])
 }