import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Polygon } from '../models/Polygon';
import { MapEditorCard } from './MapEditorCard';
import { convertPolygonsToGeoJson } from '../utils/geoJson/convertPolygonsToGeoJson';
import { convertGeoJsonSourceIdToLayerId } from '../utils/geoJson/convertGeoJsonSourceIdToLayerId';
import { GeoJsonSourceIdEnum } from '../utils/enums/geoSourceIdEnum';
import { getAnalysisGridInfo } from '../api/geometry/getAnalysisGridInfo';
import './MapComponent.css';
import { convertMeterToLongLatitude } from '../utils/geoJson/convertMeterToLongLatitude';
import { AdjustGridInfo, GridInfo } from '../models/GridInfo';
import { getAdjustGridInfo } from '../api/geometry/getAdjustGridInfo';
import { convertPointsToGeoJson } from '../utils/geoJson/convertPointsToGeoJson';
import { convertGridToGeoJson } from '../utils/geoJson/convertGridToGeoJson';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;


const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [polygon, setPolygon] = useState<Polygon>();
  const [currentGridInfo, setCurrentGridInfo] = useState<GridInfo>();
  const [parameters, setParameters] = useState<{ gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number }>({ gridX: 5, gridY: 5, rotation: 0, shiftX: 0, shiftY: 0 });
  
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
    }, [mapContainerRef.current]);
  
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
   //delete all layers when drawn polygon is deleted
        const sourceIdGridValid = GeoJsonSourceIdEnum.GridValid
        const layerIdGridValid = convertGeoJsonSourceIdToLayerId(sourceIdGridValid);
        const sourceIdGridInValid = GeoJsonSourceIdEnum.GridInValid
        const layerIdGridInValid = convertGeoJsonSourceIdToLayerId(sourceIdGridInValid);
        const sourceIdGridPoint = GeoJsonSourceIdEnum.GridPoints
        const layerIdGridPoint = convertGeoJsonSourceIdToLayerId(sourceIdGridPoint);
        const sourceIdHull = GeoJsonSourceIdEnum.ConvecHull
        const layerIdHull = convertGeoJsonSourceIdToLayerId(sourceIdHull);
        const sourceIdBbx = GeoJsonSourceIdEnum.BoundingBox
        const layerIdBbx = convertGeoJsonSourceIdToLayerId(sourceIdBbx);
      
        if (!mapRef) return;
        if (mapRef.current?.getLayer(layerIdGridValid)) mapRef.current.removeLayer(layerIdGridValid);    
        if (mapRef.current?.getSource(sourceIdGridValid)) mapRef.current.removeSource(sourceIdGridValid);
        if (mapRef.current?.getLayer(layerIdGridInValid)) mapRef.current.removeLayer(layerIdGridInValid);    
        if (mapRef.current?.getSource(sourceIdGridInValid)) mapRef.current.removeSource(sourceIdGridInValid);
        if (mapRef.current?.getLayer(layerIdGridPoint)) mapRef.current.removeLayer(layerIdGridPoint);    
        if (mapRef.current?.getSource(sourceIdGridPoint)) mapRef.current.removeSource(sourceIdGridPoint);
        if (mapRef.current?.getLayer(layerIdHull)) mapRef.current.removeLayer(layerIdHull);    
      if (mapRef.current?.getSource(sourceIdHull)) mapRef.current.removeSource(sourceIdHull);
      if (mapRef.current?.getLayer(layerIdBbx)) mapRef.current.removeLayer(layerIdBbx);    
        if (mapRef.current?.getSource(sourceIdBbx )) mapRef.current.removeSource(sourceIdBbx );
        setCurrentGridInfo(undefined);
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
  
  const showGeoElements = useCallback(async (enm: GeoJsonSourceIdEnum, isShown: boolean, color?: string) => {
    // when one of the toggles is on, convert the polygon/points into geoJson and display it 
    if (!mapRef.current || !currentGridInfo) return;
    
    const sourceId = enm;
    const layerId = convertGeoJsonSourceIdToLayerId(sourceId );
    if (mapRef.current.getLayer(layerId)) mapRef.current.removeLayer(layerId);    
    if (mapRef.current.getSource(sourceId)) mapRef.current.removeSource(sourceId);
    
    if (!isShown) return;
    
    // base on different GeoJsonSourceIdEnum decide how and what to convert into GeoJson
    let geoInfo;
    switch (enm) {
      case GeoJsonSourceIdEnum.GridPoints:
        geoInfo = convertPointsToGeoJson(sourceId, currentGridInfo.points, color);
        break;
      case GeoJsonSourceIdEnum.BoundingBox:
        geoInfo = convertPolygonsToGeoJson(sourceId, currentGridInfo.bbx, color);
        break;
      case GeoJsonSourceIdEnum.ConvecHull:
        geoInfo = convertPolygonsToGeoJson(sourceId, currentGridInfo.convexHull, color);
        break;
    }
        
    if (!geoInfo) return;

    mapRef.current.addSource(geoInfo.id, geoInfo.source);    
    mapRef.current.addLayer(geoInfo.layer);        
    mapRef.current.moveLayer(geoInfo.layer.id);
        
  }, [polygon, mapRef, currentGridInfo])

    
  const generateGrid = useCallback(async (gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => {
      // call API to initialize the grid after polygon was drawn
      if (!mapRef.current || !polygon) return;
      
      cleanupGeoJson();
    const sourceId0 = GeoJsonSourceIdEnum.GridValid;
    const sourceId1 = GeoJsonSourceIdEnum.GridInValid;
      // convert meter to long, lat
      const { longtitude, latitude } = convertMeterToLongLatitude(gridX, gridY);
      const { longtitude: shiftLongtitude, latitude: shiftLatitude } = convertMeterToLongLatitude(shiftX, shiftY)
      
     // call API to get gridInfo
      const gridInfo = await getAnalysisGridInfo(polygon, latitude, longtitude, rotation,shiftX > 0 ? shiftLatitude : -shiftLatitude, shiftY > 0 ? shiftLongtitude : -shiftLongtitude);
      setCurrentGridInfo(gridInfo);
    const grid = gridInfo.grid;
    // convert data to geoJson
          const geoInfos = convertGridToGeoJson(sourceId0,sourceId1, grid);
      
      
    geoInfos.forEach((geoInfo) => {
      if (!mapRef || !mapRef.current) return;
        mapRef.current.addSource(geoInfo.id, geoInfo.source);    
        mapRef.current.addLayer(geoInfo.layer);        
        mapRef.current.moveLayer(geoInfo.layer.id);
    })     
      
    }, [polygon, mapRef])
  
  const adjustGrid = useCallback(async (gridX:number, gridY:number, rotation:number, shiftX:number, shiftY:number) => {
    if (!mapRef.current || !currentGridInfo) return;    
    cleanupGeoJson();   
    const sourceId0 = GeoJsonSourceIdEnum.GridValid;
    const sourceId1 = GeoJsonSourceIdEnum.GridInValid;
    // convert meter to long, lat
    const { longtitude, latitude } = convertMeterToLongLatitude(gridX, gridY);
    const { longtitude: shiftLongtitude, latitude: shiftLatitude } = convertMeterToLongLatitude(shiftX, shiftY);
    // due to payload overload simplfy gridInfo
    const adjustGridInfo = {
          convexHull: currentGridInfo.convexHull,
                angle: currentGridInfo.angle,
                center: currentGridInfo.center,
                polygon: currentGridInfo.polygon,
                gridX: latitude,
                gridY: longtitude
    } as AdjustGridInfo;
    // call adjustment api
    const gridInfo = await getAdjustGridInfo(adjustGridInfo, rotation, shiftX > 0 ? shiftLatitude : -shiftLatitude, shiftY > 0 ? shiftLongtitude : -shiftLongtitude);
    setCurrentGridInfo(gridInfo);
    const grid = gridInfo.grid;
    // convert data to geoInfo
    const geoInfos = convertGridToGeoJson(sourceId0, sourceId1, grid);
    
    if (!mapRef || !mapRef.current) return;

    geoInfos.forEach((geoInfo) => {
      if (!mapRef || !mapRef.current) return;
        mapRef.current.addSource(geoInfo.id, geoInfo.source);    
        mapRef.current.addLayer(geoInfo.layer);        
        mapRef.current.moveLayer(geoInfo.layer.id);
    })
    
  }, [currentGridInfo, mapRef])
  

  return (
    <div className="component-container" style={{ position:"relative"}}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '960px' }} />
      {mapRef && <MapEditorCard polygon={polygon} mapRef={mapRef}
        adjustGrid={adjustGrid}
        handleParameterChange={(gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => {
          setParameters({gridX, gridY, rotation, shiftX, shiftY})
        }}
        handleShowBoundingBox={(val) => showGeoElements(GeoJsonSourceIdEnum.BoundingBox, val, "blue")} 
        handleShowConvexHull={(val) => showGeoElements(GeoJsonSourceIdEnum.ConvecHull, val, "green")} 
        handleShowGridPoints={(val) => showGeoElements(GeoJsonSourceIdEnum.GridPoints, val, "red")} />}
    </div>
  );
};

export default MapComponent;