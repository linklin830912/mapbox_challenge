import React, { useEffect, useState } from 'react';
import './ToggleButton.css'; // or use CSS modules

type ToggleButtonProps = {
    title: string;
    value: boolean;
    handleToggle: () => void
}
export function ToggleButton (props:ToggleButtonProps){
    return (
        <div className='container'>
            <div>{ props.title}</div>
            <div className="toggle-container" onClick={() => {
                props.handleToggle()
            }}>
                
            <div className={`toggle-slider ${props.value ? 'on' : 'off'}`}></div>
            </div>
        </div>
      
  );
};
