import React, { useEffect, useState } from 'react';
import { Polygon } from '../models/Polygon';
import { NumberInput } from '../ui/NumberInput';
import './MapEditorCard.css';
import { ToggleButton } from '../ui/ToggleButton';

type MapEditorCardProps = {
    polygon?: Polygon;
    mapRef: React.RefObject<mapboxgl.Map | null>;
    adjustGrid: (gridX: number, gridY: number, rotation: number, shiftX: number, shiftY: number) => Promise<void>;
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

    useEffect(() => {
        props.handleParameterChange(gridX,gridY,rotation,shiftX,shiftY)
    },[gridX,gridY,rotation,shiftX,setGridY])
    return <div className='editor-container' >
        <div className="input-container">

        {/* grid parameters for adjustment: the geometry will auto adjust with the parameter changes (debounce every 500ms)*/}
        <div> <NumberInput title='Grid-X' value={gridX} placeholder='5' defaultValue={5} min={1} max={Infinity}
            handleValueChange={(val) => {
                setGridX(val);
                props.adjustGrid(val, gridY??0, rotation ?? 0, shiftX ?? 0, shiftY ?? 0);
        }} />
        </div>
        <div> <NumberInput title='Grid-Y' value={gridY} placeholder='5' defaultValue={5} min={1} max={ Infinity} handleValueChange={(val) => {
                setGridY(val);
                props.adjustGrid(gridX ?? 0, val, rotation ?? 0, shiftX ?? 0, shiftY ?? 0);
        }} /> </div>
        </div>
        <div className="input-container">
            <div>
                <NumberInput title='Rotation-degrees' value={rotation} placeholder='0'  min={0} max={ 360} step={1} handleValueChange={(val) => {
                    setRotation(val);
                     props.adjustGrid(gridX??0, gridY??0, val, shiftX ?? 0, shiftY ?? 0);
                }} />
            </div>
            <div>
                <NumberInput title='Shift-X-meters' value={shiftX} placeholder='0'  min={0} max={ gridX} handleValueChange={(val) => {
                    setShiftX(val);
                     props.adjustGrid(gridX??0, gridY??0, rotation ?? 0, val, shiftY ?? 0);
                }} />
            </div>
            <div>
                <NumberInput title='Shift-Y-meters' value={shiftY} placeholder='0' min={0} max={ gridY} handleValueChange={(val) => {
                    setShiftY(val);
                     props.adjustGrid(gridX??0, gridY??0, rotation ?? 0, shiftX ?? 0, val);
                }} />
            </div>
        </div>

        {/* show grid analysis */}
        <div className="input-container">
            <ToggleButton title="Convex Hull" handleToggle={props.handleShowConvexHull} />
            <ToggleButton title="Bounding Box" handleToggle={props.handleShowBoundingBox} />
            <ToggleButton title="Grid Points" handleToggle={props.handleShowGridPoints}/>
        </div>
        
        {props.polygon && props.polygon?.length>0 && <div className='input-col-container'>
            <div>All Points</div>
            <div className='points-detail-container'> {props.polygon?.map((point, index) => <div key={ index}>{
            `x: ${point.x} y:${point.y}`
            }</div>)}
            </div>
        </div>  }      
      </div>
}



