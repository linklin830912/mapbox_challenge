import { AdjustGridInfo, GridInfo } from "../models/GridInfo";
import { Point } from "../models/Point";
import { Polygon } from "../models/Polygon";
import THREE, { MathUtils, Vector2 } from "three";

function cross(a: Point, b: Point, c: Point): number {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function convexHull(points: THREE.Vector2[]): THREE.Vector2[] {
  if (points.length < 3) return [...points];

  const hull: THREE.Vector2[] = [];

  // Find the leftmost point
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
      if (cross(points[p], points[i], points[q]) < 0) {
        q = i;
      }
    }
    p = q;
  } while (p !== leftmost); // until we wrap around
    hull.push(hull[0]);
  return hull;
}

function rayCasting(polygon: Polygon, targetPoint: THREE.Vector2): boolean {
  let intersectCount = 0;
  for (let i = 0; i < polygon.length; i++) {
    const pt0 = polygon[i];
    const pt1 = polygon[(i + 1) % polygon.length];
    let isIntersect = false;
    if (targetPoint.x === pt0.x && targetPoint.y === pt0.y) {
      isIntersect = true;
    } else if (Math.max(pt0.y, pt1.y) > targetPoint.y && targetPoint.y > Math.min(pt0.y, pt1.y)) { 
      if (Math.abs(cross(pt0, pt1, targetPoint)) <= Number.EPSILON) {// targetPoint on line
        isIntersect = true;
      } else { 
        isIntersect = targetPoint.x < ((pt1.x - pt0.x) * (targetPoint.y - pt0.y)) / (pt1.y - pt0.y + Number.EPSILON) + pt0.x;
      }
    }

    if (isIntersect) intersectCount++;
  }

  return intersectCount%2!==0;
}

function getInitGridInfo(
  polygon: Point[],
  gridX: number,
  gridY: number,
  extraRotateDegree: number,
  shiftX: number,
  shiftY: number,
): GridInfo | undefined {
  if (polygon.length < 3) return;

  const threePolygon = polygon.map(pt=>new THREE.Vector2(pt.x, pt.y))
  const hull = convexHull(threePolygon);

  let maxGridCount = 0;
  let gridInfo;

  const center = new THREE.Vector2();
    hull.forEach(p => center.add(p));
  center.divideScalar(hull.length);


  const extraRotateRadians = MathUtils.degToRad(extraRotateDegree);

  for (let i = 0; i < hull.length; i++) {
    const pt0 = hull[i].clone();
    const pt1 = hull[(i + 1) % hull.length].clone();
    const angle = -Math.atan2(pt1.y - pt0.y, pt1.x - pt0.x)+extraRotateRadians;

    const { grid, gridPoints, bbx} = getGrid(angle, center, hull, threePolygon, gridX, gridY, shiftX, shiftY);

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




export function adjustGridInfo(gridInfo: AdjustGridInfo, rotate: number, shiftX: number, shiftY: number) {
  const angle = gridInfo.angle + MathUtils.degToRad(rotate);
  const center = new Vector2(gridInfo.center.x, gridInfo.center.y);
  const hull = gridInfo.convexHull.map(pt => new THREE.Vector2(pt.x, pt.y));
  const threePolygon = gridInfo.polygon.map(pt => new THREE.Vector2(pt.x, pt.y));
  const gridX = gridInfo.gridX;
  const gridY = gridInfo.gridY;

  const { gridPoints, grid, bbx} = getGrid(angle, center, hull, threePolygon, gridX, gridY, shiftX, shiftY);
    return {
          ...gridInfo,
          points: gridPoints as Point[][],
          grid: grid,bbx
        } as GridInfo;
  
}


export function getGridInfoFromPolygon(polygon: Polygon, gridX: number, gridY: number, rotate: number, shiftX: number, shiftY: number): GridInfo {
  const gridInfo = getInitGridInfo(polygon, gridX, gridY,rotate, shiftX, shiftY);

  return {
    grid: gridInfo?.grid ?? [],
    polygon,
    convexHull: gridInfo?.convexHull ?? [],
    points: gridInfo?.points ?? [],
    angle: gridInfo?.angle ?? 0,
    center: gridInfo?.center ?? { x: 0, y: 0 },
    bbx: gridInfo?.bbx ?? [],
    gridX, gridY, 
  };
}

function getGrid(angle:number ,center: THREE.Vector2, hull:THREE.Vector2[], polygon:THREE.Vector2[], gridX:number, gridY:number,shiftX:number, shiftY:number) { 
  const translateToOriginMatrix = new THREE.Matrix3().makeTranslation(-center.x, -center.y);
  const rotationMatrix = new THREE.Matrix3().makeRotation(angle);
  const totalMatrix = new THREE.Matrix3().multiply(rotationMatrix).multiply(translateToOriginMatrix);
  const rotatedHull = hull.map(p => p.clone().applyMatrix3(totalMatrix));
  const rotatedPolygon = polygon.map(p => p.clone().applyMatrix3(totalMatrix));

  const shiftVector = new THREE.Vector2(shiftX, shiftY);
  const rotationMatrixTry = new THREE.Matrix3().makeRotation(angle);
  const rotateShiftVector = shiftVector.clone().applyMatrix3(rotationMatrixTry);

    const box = new THREE.Box2();
    rotatedHull.forEach(p => box.expandByPoint(p));
    // const offsetXY = new THREE.Vector2(gridX, gridY);
    // box.min.add(offsetXY );
    // box.max.add(offsetXY );

    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;

    const pts: {point:THREE.Vector2, isValid:boolean}[][] = [];
    const polygons:Polygon[] = [];
    for (let h = 0; h <= Math.floor(height / gridY); h++) {
      const y = box.min.y + gridY * h;
      const row: {point:THREE.Vector2, isValid:boolean}[] = [];
      for (let w = 0; w <= Math.floor(width / gridX); w++) {
        const x = box.min.x + gridX * w;
        const pt = new THREE.Vector2(x+rotateShiftVector.x, y+rotateShiftVector.y);
        row.push({ point: pt, isValid: rayCasting(rotatedPolygon, pt) });
        
        if (h !== 0 && w !== 0 && pts[h-1][w-1].isValid  && pts[h-1][w].isValid  && row[row.length-1].isValid  &&  row[row.length-2].isValid) {           
          polygons.push([pts[h-1][w-1].point, pts[h-1][w].point, row[row.length-1].point, row[row.length-2].point, pts[h-1][w-1].point]);
        }
      }
      pts.push(row);
    }

    const translateBackMatrix = new THREE.Matrix3().makeTranslation(center.x, center.y);
    const rotateBackMatrix = new THREE.Matrix3().makeRotation(-angle);
    const inverseMatrix = new THREE.Matrix3().multiply(translateBackMatrix).multiply(rotateBackMatrix);
    const gridPoints = pts.map(row => row.filter(p=>p.isValid).map(p => new THREE.Vector2(p.point.x, p.point.y).clone().applyMatrix3(inverseMatrix)));
  const grid = polygons.map(poly => poly.map(pt => new THREE.Vector2(pt.x, pt.y).clone().applyMatrix3(inverseMatrix)))

  const bbx = [{ x: box.min.x, y: box.min.y }, { x: box.max.x, y: box.min.y }, { x: box.max.x, y: box.max.y }
    , { x: box.min.x, y: box.max.y }, { x: box.min.x, y: box.min.y }].map(pt => new THREE.Vector2(pt.x, pt.y).clone().applyMatrix3(inverseMatrix))
  return {
    gridPoints, grid, bbx
  }
   
}
