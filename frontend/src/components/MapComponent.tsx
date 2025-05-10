import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Polygon } from '../models/Polygon';
import { MapEditorCard } from './MapEditorCard';
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


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;


const MapComponent = () => {
  const DEFAULT_PARAMETERS = { gridX: 5, gridY: 5, rotation: 0, shiftX: 0, shiftY: 0 };
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [polygon, setPolygon] = useState<Polygon>();
  const [currentGridInfo, setCurrentGridInfo] = useState<GridInfo>();
  const [parameters, setParameters] = useState<{ gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number }>(DEFAULT_PARAMETERS);
  const [resetParameters, setResetParameters] = useState<boolean>(false);
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
      updatePolygon("create", draw.getAll());      
    });

    map.on('draw.delete', (e) => {
      updatePolygon("delete", draw.getAll());
    });

    map.on('draw.update', (e) => {
      updatePolygon("update", draw.getAll());
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
      generateGrid(parameters.gridX, parameters.gridY, parameters.rotation, parameters.shiftX, parameters.shiftY);//default value
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
    setCurrentGridInfo(undefined);
    setResetParameters(!resetParameters);
  },[polygon, mapRef])
  
  const updatePolygon = useCallback((type: "update" | "delete" | "create", data: any) => {
    // update the polygon whenever it changes
      if (data.features.length > 0) {
        const newPoly = (data.features[0].geometry as any).coordinates[0]
          .map((coord: [number, number]) => { return { x: coord[0], y: coord[1] } })
        setPolygon(newPoly);
      } else if (type === "delete") {
        setPolygon(undefined)
      }
  }, [setPolygon])
  
  const showGeoElements = useCallback(async (enm: GeoJsonSourceIdEnum[], isShown: boolean) => {
    // when one of the toggles is on, convert the polygon/points into geoJson and display it 
    if (!mapRef.current || !currentGridInfo) return;
    
    const sourceIds = enm;
    const layerIds = sourceIds.map(sourceId => convertGeoJsonSourceIdToLayerId(sourceId));
    layerIds.forEach(layerId => {
      if (mapRef.current && mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);
    })
    sourceIds.forEach(sourceId => {
      if (mapRef.current && mapRef.current.getSource(sourceId)) mapRef.current.removeSource(sourceId);
    })
    
    if (!isShown) return;
    
    // base on different GeoJsonSourceIdEnum decide how and what to convert into GeoJson
    
    sourceIds.forEach(sourceId => {
      let geoInfo;
      switch (sourceId) {
        case GeoJsonSourceIdEnum.GridPoints:
          geoInfo = convertPointsToGeoJson(sourceId, currentGridInfo.points, "red");
          break;
        case GeoJsonSourceIdEnum.BoundingBox:
          geoInfo = convertPolygonsToGeoJson(sourceId, currentGridInfo.bbx, "gray");
          break;
        case GeoJsonSourceIdEnum.ConvecHull:
          geoInfo = convertPolygonsToGeoJson(sourceId, currentGridInfo.convexHull, "green");
          break;
        case GeoJsonSourceIdEnum.BoundingBoxArrowX:
          geoInfo = convertBbxToArrowGeoJson(sourceId, currentGridInfo.bbx, "red", true);
          break;
        case GeoJsonSourceIdEnum.BoundingBoxArrowY:
          geoInfo = convertBbxToArrowGeoJson(sourceId, currentGridInfo.bbx, "blue", false);
          break;
      }
      addGeoJsonToMap(geoInfo);
    })
        
  }, [polygon, mapRef, currentGridInfo])
    
  const generateGrid = useCallback(async (gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => {
    // call API to initialize the grid after polygon was drawn
    if (!mapRef.current || !polygon) return;    
    cleanupGeoJson();
    
    try {
      // call API to get gridInfo
      const gridInfo = await getAnalysisGridInfo(polygon, gridX, gridY, rotation, shiftX, shiftY);
      console.log(gridInfo  )
      setCurrentGridInfo(gridInfo);
      const grid = gridInfo.grid;
      // convert data to geoJson
      const sourceId0 = GeoJsonSourceIdEnum.GridValid;
      const sourceId1 = GeoJsonSourceIdEnum.GridInValid;
      const geoInfos = convertGridToGeoJson(sourceId0, sourceId1, grid);
      
      geoInfos.forEach((geoInfo) => { addGeoJsonToMap(geoInfo); })    
    }catch(err){console.log(err)}
    }, [polygon, mapRef])
  
  const adjustGrid = useCallback(async (gridX:number, gridY:number, rotation:number, shiftX:number, shiftY:number) => {
    if (!mapRef.current || !currentGridInfo) return;    
    cleanupGeoJson();
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
      const grid = gridInfo.grid;
      // convert data to geoInfo
      const sourceId0 = GeoJsonSourceIdEnum.GridValid;
      const sourceId1 = GeoJsonSourceIdEnum.GridInValid;
      const geoInfos = convertGridToGeoJson(sourceId0, sourceId1, grid);

      if (!mapRef || !mapRef.current) return;
      geoInfos.forEach((geoInfo) => { addGeoJsonToMap(geoInfo) });
    } catch (err) { console.log(err) }
    
  }, [currentGridInfo, mapRef])
  

  return (
    <div className="component-container" style={{ position:"relative"}}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '960px' }} />
      {mapRef && <MapEditorCard polygon={polygon} mapRef={mapRef}
        adjustGrid={adjustGrid}
        resetParameters={resetParameters}
        handleParameterChange={(gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => {
          setParameters({gridX, gridY, rotation, shiftX, shiftY})
        }}
        handleShowBoundingBox={(val) => showGeoElements([GeoJsonSourceIdEnum.BoundingBox, GeoJsonSourceIdEnum.BoundingBoxArrowX, GeoJsonSourceIdEnum.BoundingBoxArrowY], val)} 
        handleShowConvexHull={(val) => showGeoElements([GeoJsonSourceIdEnum.ConvecHull], val)} 
        handleShowGridPoints={(val) => showGeoElements([GeoJsonSourceIdEnum.GridPoints], val)} />}
    </div>
  );
};

export default MapComponent;