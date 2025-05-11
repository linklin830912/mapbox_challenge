import { GeoJsonInfo } from "../../models/GeoJsonInfo";
import { Polygon } from "../../models/Polygon";
import { convertGeoJsonSourceIdToLayerId } from "./convertGeoJsonSourceIdToLayerId";

export function convertBbxToArrowGeoJson(id: string ,bbx: Polygon, color:string, isX:boolean) {
    const features: GeoJSON.Feature[] = [];

    const axis: GeoJSON.LineString = {
        type: 'LineString',
        coordinates: isX ? [[bbx[0].x,bbx[0].y], [bbx[1].x,bbx[1].y]] : [[bbx[0].x,bbx[0].y], [bbx[3].x,bbx[3].y]] 
    };
    features.push({ type: 'Feature', geometry: axis, properties: {} })

    const gridGeoJSON = {
        type: 'FeatureCollection',
        features
    };
    
    return {
        id: id,
        source:{
            type: 'geojson',
            data: gridGeoJSON as GeoJSON.FeatureCollection
        },
        layer:{
            id: convertGeoJsonSourceIdToLayerId(id),
            type: 'line',
            source: id,
            paint: {
              'line-color': color ?? 'red',
              'line-width': 3
            },
        }
    } as GeoJsonInfo

}



