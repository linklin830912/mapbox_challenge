import THREE from "three";
import { rayCastingForPointInPolygon } from "./rayCastingForPointInPolygon";
import { Polygon } from "../../models/geometry/Polygon";
import { ExtraParameters } from "../../models/information/ExtraParameters";
import { Grid } from "../../models/geometry/Grid";


export function gridFromParameters(hull: THREE.Vector2[], polygon: THREE.Vector2[], gridX: number, gridY: number, center: THREE.Vector2, extra: ExtraParameters) { 
    // orient to world 0,0
    const translateToOriginMatrix = new THREE.Matrix3().makeTranslation(-center.x, -center.y);
    const rotationMatrix = new THREE.Matrix3().makeRotation(extra.rotate);
    const totalMatrix = new THREE.Matrix3().multiply(rotationMatrix).multiply(translateToOriginMatrix);
    const rotatedHull = hull.map(p => p.clone().applyMatrix3(totalMatrix));
    const rotatedPolygon = polygon.map(p => p.clone().applyMatrix3(totalMatrix));

    const shiftVector = new THREE.Vector2(extra.shiftX, extra.shiftY);
    const rotateShiftVector = shiftVector.clone().applyMatrix3(rotationMatrix);

    const box = new THREE.Box2();
    rotatedHull.forEach(p => box.expandByPoint(p));

    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;

    const pts: {point:THREE.Vector2, isValid:boolean}[][] = [];
    const polygons:Grid = [];
    for (let h = 0; h <= Math.floor(height / gridY); h++) {
        const y = box.min.y + gridY * h;
        const row: {point:THREE.Vector2, isValid:boolean}[] = [];
        for (let w = 0; w <= Math.floor(width / gridX); w++) {
            const x = box.min.x + gridX * w;
            const pt = new THREE.Vector2(x + rotateShiftVector.x, y + rotateShiftVector.y);
            // check valid points
            row.push({ point: pt, isValid: rayCastingForPointInPolygon(rotatedPolygon, pt) });
            // if all points are in hull, add the polygon
            if (h !== 0 && w !== 0) {  
                const isValid = pts[h - 1][w - 1].isValid && pts[h - 1][w].isValid && row[row.length - 1].isValid && row[row.length - 2].isValid;
                const poly = [pts[h - 1][w - 1].point, pts[h - 1][w].point, row[row.length - 1].point, row[row.length - 2].point, pts[h - 1][w - 1].point];
                polygons.push({polygon: poly, isValid});
            }
        }
        pts.push(row);
    }
    // orient to back
    const translateBackMatrix = new THREE.Matrix3().makeTranslation(center.x, center.y);
    const rotateBackMatrix = new THREE.Matrix3().makeRotation(-extra.rotate);
    const inverseMatrix = new THREE.Matrix3().multiply(translateBackMatrix).multiply(rotateBackMatrix);
    const gridPoints = pts.map(row => row.filter(p=>p.isValid).map(p => new THREE.Vector2(p.point.x, p.point.y).clone().applyMatrix3(inverseMatrix)));
    const grid = polygons.map(poly => { return { polygon: poly.polygon.map(pt => new THREE.Vector2(pt.x, pt.y).clone().applyMatrix3(inverseMatrix)) as Polygon, isValid: poly.isValid } }) as Grid;
    const bbx = [{ x: box.min.x, y: box.min.y }, { x: box.max.x, y: box.min.y }, { x: box.max.x, y: box.max.y },{ x: box.min.x, y: box.max.y }, { x: box.min.x, y: box.min.y }].map(pt => new THREE.Vector2(pt.x, pt.y).clone().applyMatrix3(inverseMatrix))
    
    return {
        gridPoints, grid, bbx
    }
   
}