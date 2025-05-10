import React, { useCallback, useEffect, useRef, useState } from 'react';
import './NumberInputs.css';
import { debounce } from 'lodash';

type NumberInputProps = {
  title: string
  value: number
  handleValueChange: (e: number) => void
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  description?: string;
  subdescription?: string;
  disableWheel?:boolean
}
export function NumberInput(props: NumberInputProps) {
  const debouncedChange = useCallback(
    debounce((val: number) => {      
      props.handleValueChange(val)
    }, 100),
    [props.handleValueChange]
  );
  return (
    <div className="number-input-container">
      <label> {props.title}
        <input type="number" value={props.value}
          onWheel={(e) => {
            if (props.disableWheel) e.currentTarget.blur()
          }}
          step={props.step ?? 0.1}
          min={props.min} max={props.max}
          onChange={(e) => {
            let value = Math.max(Number(e.target.value), props.min);
            value = Math.min(value, props.max);
            if (!props.disableWheel) {debouncedChange(value);}
            else {
              props.handleValueChange(value)
            }
          }} />
      </label>
      <div className='description-container'>
        <div>{props.description}</div>
        <div>{props.subdescription}</div>
      </div>      
    </div>
  );
};
