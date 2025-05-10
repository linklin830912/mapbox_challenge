import THREE, { MathUtils, Vector2 } from "three";
import { convexHullFromPolygon } from "../service/geometry/convexHullFromPolygon";
import { gridFromParameters } from "../service/geometry/gridFromParameters";
import { Point } from "../models/geometry/Point";
import { AdjustGridInfo, DEFAULT_GRID_INFO, GridInfo } from "../models/information/GridInfo";
import { ExtraParameters } from "../models/information/ExtraParameters";


export function getInitGridInfo(
  polygon: Point[],
  gridX: number,
  gridY: number,
  extra: ExtraParameters
): GridInfo {
  // convert from model to three
  const threePolygon = polygon.map(pt => new THREE.Vector2(pt.x, pt.y))
  // convert polygon to convexhull
  const hull = convexHullFromPolygon(threePolygon);

  let maxGridCount = 0;
  let gridInfo: GridInfo = DEFAULT_GRID_INFO;

  // get center of convex hull
  const center = new THREE.Vector2();
  hull.forEach(p => center.add(p));
  center.divideScalar(hull.length);

  // get extra rotate angle
  const extraRotate = MathUtils.degToRad(extra.rotate);

  for (let i = 0; i < hull.length; i++) {
    const pt0 = hull[i].clone();
    const pt1 = hull[(i + 1) % hull.length].clone();
    const angle = -Math.atan2(pt1.y - pt0.y, pt1.x - pt0.x)+extraRotate;

    const { grid, gridPoints, bbx } = gridFromParameters(hull, threePolygon, gridX, gridY, center,
      { rotate: angle, shiftX: extra.shiftX, shiftY: extra.shiftY });

    if (grid.length > maxGridCount) {
      maxGridCount = grid.length;
      gridInfo = {
        angle: angle,
        center: center,
        points: gridPoints as Point[][],
        grid: grid,
        convexHull: hull,
        polygon: polygon,
        gridX,
        gridY,
        bbx: bbx
      } as GridInfo;
    }
  }
  return gridInfo;
}

export function adjustGridInfo(gridInfo: AdjustGridInfo, extra: ExtraParameters) {
  // convert from model to three
  const angle = gridInfo.angle + MathUtils.degToRad(extra.rotate);
  const center = new Vector2(gridInfo.center.x, gridInfo.center.y);
  const hull = gridInfo.convexHull.map(pt => new THREE.Vector2(pt.x, pt.y));
  const threePolygon = gridInfo.polygon.map(pt => new THREE.Vector2(pt.x, pt.y));  
  const gridX = gridInfo.gridX;
  const gridY = gridInfo.gridY;

  const { gridPoints, grid, bbx } = gridFromParameters(hull, threePolygon, gridX, gridY, center
    , { rotate: angle, shiftX: extra.shiftX, shiftY: extra.shiftY });
    return {
          ...gridInfo,
          points: gridPoints as Point[][],
          grid: grid,bbx
        } as GridInfo;
  
}