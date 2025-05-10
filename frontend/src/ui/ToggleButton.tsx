import React, { useEffect, useState } from 'react';
import './ToggleButton.css'; // or use CSS modules

type ToggleButtonProps = {
    title: string;
    handleToggle: (v: boolean) => void
    reset:boolean
}
export function ToggleButton (props:ToggleButtonProps){
  const [isOn, setIsOn] = useState(false);
        useEffect(() => {
            setIsOn(false);
            console.log("!!!");
    },[props.reset])
    return (
        <div className='container'>
            <div>{ props.title}</div>
            <div className="toggle-container" onClick={() => {
                setIsOn(prev => !prev);
                props.handleToggle(!isOn)
            }}>
                
            <div className={`toggle-slider ${isOn ? 'on' : 'off'}`}></div>
            </div>
        </div>
      
  );
};
