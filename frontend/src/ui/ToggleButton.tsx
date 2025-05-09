import React, { useState } from 'react';
import './ToggleButton.css'; // or use CSS modules

type ToggleButtonProps = {
    title: string;
    handleToggle:(v: boolean)=>void
}
export function ToggleButton (props:ToggleButtonProps){
  const [isOn, setIsOn] = useState(false);

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
