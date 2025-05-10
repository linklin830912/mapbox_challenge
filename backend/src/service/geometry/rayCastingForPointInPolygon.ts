import { Polygon } from "../../models/geometry/Polygon";
import { crossProduct } from "../math/crossProduct";
import THREE from "three";

export function rayCastingForPointInPolygon(polygon: Polygon, targetPoint: THREE.Vector2): boolean {
  let intersectCount = 0;
  for (let i = 0; i < polygon.length; i++) {
    const pt0 = polygon[i];
    const pt1 = polygon[(i + 1) % polygon.length];
    let isIntersect = false;
    if (targetPoint.x === pt0.x && targetPoint.y === pt0.y) {
      isIntersect = true;
    } else if (Math.max(pt0.y, pt1.y) > targetPoint.y && targetPoint.y > Math.min(pt0.y, pt1.y)) { 
      if (Math.abs(crossProduct(pt0, pt1, targetPoint)) <= Number.EPSILON) {// targetPoint on line
        isIntersect = true;
      } else { 
        isIntersect = targetPoint.x < ((pt1.x - pt0.x) * (targetPoint.y - pt0.y)) / (pt1.y - pt0.y + Number.EPSILON) + pt0.x;
      }
    }

    if (isIntersect) intersectCount++;
  }

  return intersectCount%2!==0;
}