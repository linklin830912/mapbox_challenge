import React, { useEffect, useState } from 'react';
import { Polygon } from '../models/Polygon';
import { NumberInput } from '../ui/NumberInput';
import './MapEditorCard.css';
import { ToggleButton } from '../ui/ToggleButton';

type MapEditorCardProps = {
    polygon?: Polygon;
    mapRef: React.RefObject<mapboxgl.Map | null>;
    adjustGrid: (gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => Promise<void>;
    resetParameters: boolean;
    handleShowGridPoints: (v:boolean) => void;
    handleShowConvexHull: (v:boolean) => void;
    handleShowBoundingBox: (v: boolean) => void;
    handleParameterChange: (gridX:number, gridY:number, rotation:number, shiftX:number, shiftY:number) => void;
}
export function MapEditorCard(props: MapEditorCardProps) {
    const [gridX, setGridX] = useState<number>(5);
    const [gridY, setGridY] = useState<number>(5);
    const [rotation, setRotation] = useState<number>(0);
    const [shiftX, setShiftX] = useState<number>(0);
    const [shiftY, setShiftY] = useState<number>(0);
    const [enableScrolling, setEnableScrolling] = useState<boolean>(false);
    const [resetToggle, setResetToggle] = useState<boolean>(false);
    useEffect(() => {
        // reset to default
        setGridX(5);
        setGridY(5);
        setRotation(0);
        setShiftX(0);
        setShiftY(0);
    },[props.resetParameters])
    useEffect(() => {
        props.handleParameterChange(gridX,gridY,rotation,shiftX,shiftY)
    },[gridX,gridY,rotation,shiftX,setGridY])
    return <div className='editor-container' >
        <div className='checkbox-container'>
            Enable Scrolling
            <input type='checkbox' onChange={(e)=>{setEnableScrolling(!enableScrolling)}}/>
        </div>
        <div className="adjust-input-container">
            <div className="input-container">
                {/* grid parameters for adjustment: the geometry will auto adjust with the parameter changes (debounce every 500ms)*/}
                <div> <NumberInput title='Grid-X' value={gridX}  defaultValue={5} min={1} max={Infinity}  disableWheel={!enableScrolling}
                    handleValueChange={(val) => {
                        setGridX(val);
                        if (enableScrolling) {
                            props.adjustGrid(val, gridY ?? 0, rotation ?? 0, shiftX ?? 0, shiftY ?? 0);
                            setResetToggle(!resetToggle)
                        }
                }} />
                </div>
                <div> <NumberInput title='Grid-Y' value={gridY} defaultValue={5} min={1} max={Infinity}  disableWheel={!enableScrolling}
                    handleValueChange={(val) => {
                        setGridY(val);
                        if (enableScrolling) {
                            props.adjustGrid(gridX ?? 0, val, rotation ?? 0, shiftX ?? 0, shiftY ?? 0);
                            setResetToggle(!resetToggle)
                        }
                }} /> </div>
            </div>
            <div className="input-container">
                <div>
                    <NumberInput title='Rotation' value={rotation} defaultValue={0} min={0} max={360} step={1}  disableWheel={!enableScrolling}
                        handleValueChange={(val) => {
                        setRotation(val);
                            if (enableScrolling) {
                                props.adjustGrid(gridX ?? 0, gridY ?? 0, val, shiftX ?? 0, shiftY ?? 0);
                                setResetToggle(!resetToggle)
                            }
                    }} description='degrees' subdescription='0-360'/>
                </div>
                <div>
                    <NumberInput title='Shift-X' value={shiftX} defaultValue={0} min={-gridX} max={gridX}  disableWheel={!enableScrolling}
                        handleValueChange={(val) => {
                        setShiftX(val);
                            if (enableScrolling) {
                                props.adjustGrid(gridX ?? 0, gridY ?? 0, rotation ?? 0, val, shiftY ?? 0);
                                setResetToggle(!resetToggle)
                            }
                    }} description='meters' subdescription={`${-gridX}-${gridX}`} />
                </div>
                <div>
                    <NumberInput title='Shift-Y' value={shiftY} defaultValue={0} min={-gridY} max={gridY} disableWheel={!enableScrolling}
                        handleValueChange={(val) => {
                        setShiftY(val);
                            if (enableScrolling) {
                                props.adjustGrid(gridX ?? 0, gridY ?? 0, rotation ?? 0, shiftX ?? 0, val);
                                setResetToggle(!resetToggle)
                            }
                    }} description='meters' subdescription={`${-gridY}-${gridY}`}/>
                </div>
                
            </div>
            {!enableScrolling && <button onClick={() => {
                props.adjustGrid(gridX ?? 0, gridY ?? 0, rotation ?? 0, shiftX ?? 0, shiftY ?? 0);
                setResetToggle(!resetToggle)
            }}>Adjust Parameters</button>}
        </div>
        
        {/* show grid analysis */}
        <div className="toggle-input-container input-container">
            <ToggleButton reset={ resetToggle } title="Convex Hull" handleToggle={props.handleShowConvexHull} />
            <ToggleButton reset={ resetToggle } title="BBox" handleToggle={props.handleShowBoundingBox} />
            <ToggleButton reset={ resetToggle } title="Grid Points" handleToggle={props.handleShowGridPoints}/>
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



