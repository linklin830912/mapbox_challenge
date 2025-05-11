import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Polygon } from '../models/Polygon';
import { DEFAULT_PARAMETERS, MapEditorCard } from './MapEditorCard';
import { convertPolygonsToGeoJson } from '../utils/geoJson/convertPolygonsToGeoJson';
import { convertGeoJsonSourceIdToLayerId } from '../utils/geoJson/convertGeoJsonSourceIdToLayerId';
import { GeoJsonSourceIdEnum } from '../utils/enums/geoSourceIdEnum';
import { getAnalysisGridInfo } from '../api/geometry/getAnalysisGridInfo';
import './MapComponent.css';
import { AdjustGridInfo, GridInfo } from '../models/GridInfo';
import { getAdjustGridInfo } from '../api/geometry/getAdjustGridInfo';
import { convertPointsToGeoJson } from '../utils/geoJson/convertPointsToGeoJson';
import { convertGridToGeoJson } from '../utils/geoJson/convertGridToGeoJson';
import { GeoJsonInfo } from '../models/GeoJsonInfo';
import { convertBbxToArrowGeoJson } from '../utils/geoJson/convertBbxToArrowGeoJson';
import { GeoJsonDisplayEnum } from '../utils/enums/geoJsonDisplayEnum';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;


const MapComponent = () => {
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [polygon, setPolygon] = useState<Polygon>();
  const [currentGridInfo, setCurrentGridInfo] = useState<GridInfo>();
  const [parameters, setParameters] = useState<{ gridX: number, gridY: number, rotate: number, shiftX: number, shiftY: number }>(DEFAULT_PARAMETERS);
  const [resetParameters, setResetParameters] = useState<boolean>(false);
  const [showGeoDisplayEnums, setShowGeoDisplayEnums] = useState<GeoJsonDisplayEnum[]>([]);
  useEffect(() => {
    // map init setups
    if (!mapContainerRef.current) return;      
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [151.2093, -33.8688],
      zoom: 18,
    });
    
    // draw polygon setup
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    } as any);

    map.addControl(draw);
    mapRef.current = map;
    map.on('draw.create', (e) => {
      setPolygon((draw.getAll().features[0].geometry as any).coordinates[0]
        .map((coord: [number, number]) => { return { x: coord[0], y: coord[1] } })); 
    });

    map.on('draw.update', (e) => {
      setPolygon((draw.getAll().features[0].geometry as any).coordinates[0]
        .map((coord: [number, number]) => { return { x: coord[0], y: coord[1] } })); 
    });

    map.on('draw.delete', (e) => {
      setPolygon(undefined);
      setCurrentGridInfo(undefined);
      setResetParameters(!resetParameters);
    });
    return () => map.remove();
  }, [mapContainerRef]);
  
  const addGeoJsonToMap = (geoJsonInfo?: GeoJsonInfo) => {
    if (!geoJsonInfo || !mapRef.current) return;
    mapRef.current.addSource(geoJsonInfo.id, geoJsonInfo.source);    
    mapRef.current.addLayer(geoJsonInfo.layer);        
    mapRef.current.moveLayer(geoJsonInfo.layer.id);
  }
  
  useEffect(() => {
    if (!polygon) {
      // if no polygon is deleted make sure gridInfo is also deleted
      cleanupGeoJson();
    } else { 
      // if polygon was drawn trigger API
      generateGrid(parameters.gridX, parameters.gridY, parameters.rotate, parameters.shiftX, parameters.shiftY);
    }    
  }, [polygon, mapRef])
  
  const cleanupGeoJson = useCallback(() => {
    if (!mapRef) return;
    //delete all layers when drawn polygon is deleted
    Object.values(GeoJsonSourceIdEnum).forEach((sourceId) => {
      const layerId = convertGeoJsonSourceIdToLayerId(sourceId);
      if (mapRef.current?.getLayer(layerId)) mapRef.current.removeLayer(layerId);
      if (mapRef.current?.getSource(sourceId)) mapRef.current.removeSource(sourceId);
    })
  }, [polygon, mapRef])
  
  useEffect(() => {
    if (!mapRef.current || !currentGridInfo) return;
    cleanupGeoJson();
    let geoInfos: GeoJsonInfo[] = [];
    showGeoDisplayEnums.forEach((enm) => {      
      switch (enm) {
        case GeoJsonDisplayEnum.BoundingBox:
          geoInfos.push(convertPolygonsToGeoJson(GeoJsonSourceIdEnum.BoundingBox, currentGridInfo.bbx, "gray"));
          geoInfos.push(convertBbxToArrowGeoJson(GeoJsonSourceIdEnum.BoundingBoxArrowX, currentGridInfo.bbx, "red", true));
          geoInfos.push(convertBbxToArrowGeoJson(GeoJsonSourceIdEnum.BoundingBoxArrowY, currentGridInfo.bbx, "blue", false));
          break;
        case GeoJsonDisplayEnum.ConvexHull:
          geoInfos.push(convertPolygonsToGeoJson(GeoJsonSourceIdEnum.ConvecHull, currentGridInfo.convexHull, "green"));
          break;
        case GeoJsonDisplayEnum.GridPoints:
          geoInfos.push(convertPointsToGeoJson(GeoJsonSourceIdEnum.GridPoints, currentGridInfo.points, "red"));
            break;        
      }
    })
    const sourceId0 = GeoJsonSourceIdEnum.GridValid;
    const sourceId1 = GeoJsonSourceIdEnum.GridInValid;
    geoInfos = [...geoInfos, ...convertGridToGeoJson(sourceId0, sourceId1, currentGridInfo.grid)];
    geoInfos.forEach((geoInfo)=>addGeoJsonToMap(geoInfo));        
  }, [mapRef, showGeoDisplayEnums, currentGridInfo])
    
  const generateGrid = useCallback(async (gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => {
    // call API to initialize the grid after polygon was drawn
    if (!mapRef.current || !polygon) return;    
    try {
      // call API to get gridInfo
      const gridInfo = await getAnalysisGridInfo(polygon, gridX, gridY, rotation, shiftX, shiftY);
      setCurrentGridInfo(gridInfo);  
    }catch(err){console.log(err)}
    }, [polygon, mapRef])
  
  const adjustGrid = useCallback(async (gridX:number, gridY:number, rotation:number, shiftX:number, shiftY:number) => {
    if (!mapRef.current || !currentGridInfo) return;
    // convert meter to long, lat    
    // due to payload overload simplfy gridInfo
    const adjustGridInfo = {
      convexHull: currentGridInfo.convexHull,
      angle: currentGridInfo.angle,
      center: currentGridInfo.center,
      polygon: currentGridInfo.polygon,
      gridX,
      gridY
    } as AdjustGridInfo;
    try {
      // call adjustment api
      const gridInfo = await getAdjustGridInfo(adjustGridInfo, rotation, shiftX, shiftY);
      setCurrentGridInfo(gridInfo);
    } catch (err) { console.log(err) }    
  }, [currentGridInfo, mapRef])
  

  return (
    <div className="component-container" style={{ position:"relative"}}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '960px' }} />
      {mapRef && <MapEditorCard polygon={polygon} mapRef={mapRef}
        adjustGrid={adjustGrid}
        resetParameters={resetParameters}
        handleParameterChange={({gridX, gridY, rotate, shiftX, shiftY}) => {
          setParameters({gridX, gridY, rotate, shiftX, shiftY})}}
        displayGeoJsons={showGeoDisplayEnums}
        handleShowGeoJson={(enums)=>setShowGeoDisplayEnums(enums)}
      />}
    </div>
  );
};

export default MapComponent;