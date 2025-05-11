import React, { useCallback, useEffect, useState } from 'react';
import { Polygon } from '../models/Polygon';
import { NumberInput } from '../ui/NumberInput';
import './MapEditorCard.css';
import { ToggleButton } from '../ui/ToggleButton';
import { GeoJsonDisplayEnum } from '../utils/enums/geoJsonDisplayEnum';

type MapEditorCardProps = {
    polygon?: Polygon;
    mapRef: React.RefObject<mapboxgl.Map | null>;
    adjustGrid: (gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => Promise<void>;
    resetParameters: boolean;
    displayGeoJsons: GeoJsonDisplayEnum[];
    handleShowGeoJson: (displayGeoJsons: GeoJsonDisplayEnum[]) => void;
    handleParameterChange: (params:{gridX:number, gridY:number, rotate:number, shiftX:number, shiftY:number}) => void;
}
export const DEFAULT_PARAMETERS = { gridX: 5, gridY: 5, rotate: 0, shiftX: 0, shiftY: 0 };
export function MapEditorCard(props: MapEditorCardProps) {
    const [parameters, setParameters] = useState<{gridX:number, gridY:number, rotate:number, shiftX:number, shiftY:number}>(DEFAULT_PARAMETERS)
    const [enableScrolling, setEnableScrolling] = useState<boolean>(false);
    const [resetToggle, setResetToggle] = useState<boolean>(false);
    useEffect(() => {
        props.handleParameterChange(DEFAULT_PARAMETERS);
    },[])
    useEffect(() => {
        // reset to default
        setParameters(DEFAULT_PARAMETERS);
    }, [props.resetParameters]);
    const handleToggleShow = useCallback((displayGeo:GeoJsonDisplayEnum) => {
        if (props.displayGeoJsons.includes(displayGeo)) {
            const displayGeoJsons = props.displayGeoJsons.filter(x => x !== displayGeo);
            props.handleShowGeoJson(displayGeoJsons);
        } else { 
            props.handleShowGeoJson([...props.displayGeoJsons, displayGeo]);
        }
    },[props.displayGeoJsons])
    useEffect(() => {
        props.handleParameterChange(parameters)
    },[parameters])
    return <div className='editor-container' >
        <div className='checkbox-container'>
            Enable Scrolling
            <input type='checkbox' onChange={(e)=>{setEnableScrolling(!enableScrolling)}}/>
        </div>
        <div className="adjust-input-container">
            <div className="input-container">
                {/* grid parameters for adjustment: the geometry will auto adjust with the parameter changes (debounce every 500ms)*/}
                <div> <NumberInput title='Grid-X' value={parameters.gridX}  defaultValue={5} min={1} max={Infinity}  disableWheel={!enableScrolling}
                    handleValueChange={(val) => {
                        setParameters({...parameters, gridX:val});
                        if (enableScrolling) {
                            props.adjustGrid(val, parameters.gridY, parameters.rotate, parameters.shiftX, parameters.shiftY);
                            setResetToggle(!resetToggle)
                        }
                }} />
                </div>
                <div> <NumberInput title='Grid-Y' value={parameters.gridY} defaultValue={5} min={1} max={Infinity}  disableWheel={!enableScrolling}
                    handleValueChange={(val) => {
                        setParameters({...parameters, gridY:val});
                        if (enableScrolling) {
                            props.adjustGrid(parameters.gridX, val, parameters.rotate, parameters.shiftX, parameters.shiftY);
                            setResetToggle(!resetToggle)
                        }
                }} /> </div>
            </div>
            <div className="input-container">
                <div>
                    <NumberInput title='Rotation' value={parameters.rotate} defaultValue={0} min={0} max={360} step={1}  disableWheel={!enableScrolling}
                        handleValueChange={(val) => {
                            setParameters({...parameters, rotate:val});
                            if (enableScrolling) {
                                props.adjustGrid(parameters.gridX, parameters.gridY, val, parameters.shiftX, parameters.shiftY);
                                setResetToggle(!resetToggle)
                            }
                    }} description='degrees' subdescription='0-360'/>
                </div>
                <div className='shift-x-container'>
                    <NumberInput title='Shift-X' value={parameters.shiftX} defaultValue={0} min={-parameters.gridX} max={parameters.gridX}  disableWheel={!enableScrolling}
                        handleValueChange={(val) => {
                            setParameters({...parameters, shiftX:val});
                            if (enableScrolling) {
                                props.adjustGrid(parameters.gridX, parameters.gridY, parameters.rotate, val, parameters.shiftY);
                                setResetToggle(!resetToggle)
                            }
                    }} description='meters' subdescription={`${-parameters.gridX}-${parameters.gridX}`} />
                </div>
                <div className='shift-y-container'>
                    <NumberInput title='Shift-Y' value={parameters.shiftY} defaultValue={0} min={-parameters.gridY} max={parameters.gridY} disableWheel={!enableScrolling}
                        handleValueChange={(val) => {
                            setParameters({...parameters, shiftY:val});
                            if (enableScrolling) {
                                props.adjustGrid(parameters.gridX, parameters.gridY, parameters.rotate, parameters.shiftX, val);
                                setResetToggle(!resetToggle)
                            }
                    }} description='meters' subdescription={`${-parameters.gridY}-${parameters.gridY}`}/>
                </div>
                
            </div>
            {!enableScrolling && <button onClick={() => {
                props.adjustGrid(parameters.gridX, parameters.gridY, parameters.rotate, parameters.shiftX, parameters.shiftY);
                setResetToggle(!resetToggle)
            }}>Adjust Parameters</button>}
        </div>
        
        {/* show grid analysis */}
        <div className="toggle-input-container input-container">
            <ToggleButton title="Convex Hull"
                value={props.displayGeoJsons.includes(GeoJsonDisplayEnum.ConvexHull)}
                handleToggle={() => { handleToggleShow(GeoJsonDisplayEnum.ConvexHull);
                }} />
            <ToggleButton title="Bounding Box"
                value={props.displayGeoJsons.includes(GeoJsonDisplayEnum.BoundingBox)}
                handleToggle={() => { handleToggleShow(GeoJsonDisplayEnum.BoundingBox);
                }} />
             <ToggleButton title="Grid Points"
                value={props.displayGeoJsons.includes(GeoJsonDisplayEnum.GridPoints)}
                handleToggle={() => { handleToggleShow(GeoJsonDisplayEnum.GridPoints);
            }} />
        </div>
        
        {props.polygon && props.polygon?.length>0 && <div className='input-col-container'>
            <div>All Points ({ props.polygon?.length }) </div>
            <div className='points-detail-container'> {props.polygon?.map((point, index) => <div key={ index}>{
            `x: ${point.x} y:${point.y}`
            }</div>)}
            </div>
        </div>  }      
      </div>
}



