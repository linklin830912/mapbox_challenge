import THREE from "three";
import { crossProduct } from "../math/crossProduct";
export function convexHullFromPolygon(points: THREE.Vector2[]): THREE.Vector2[] {
  if (points.length < 3) return [...points];

  const hull: THREE.Vector2[] = [];
  let leftmost = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x < points[leftmost].x) {
      leftmost = i;
    }
  }

  let p = leftmost;
  let q: number;

  do {
    hull.push(points[p]);
    q = (p + 1) % points.length;
    for (let i = 0; i < points.length; i++) {
      if (crossProduct(points[p], points[i], points[q]) < 0) {
        q = i;
      }
    }
    p = q;
  } while (p !== leftmost); // util close the polygon
    hull.push(hull[0]);
  return hull;
}