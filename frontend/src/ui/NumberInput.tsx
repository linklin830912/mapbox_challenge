import React, { useCallback, useEffect, useRef, useState } from 'react';
import './NumberInputs.css';
import { debounce } from 'lodash';

type NumberInputProps = {
  title: string
  value?: number
  placeholder?: string;
  handleValueChange: (e: number) => void
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
}
export function NumberInput(props: NumberInputProps) {

  const debouncedChange = useCallback(
    debounce((val: number) => {
      props.handleValueChange(val)
    }, 500),
    [props.handleValueChange]
  );
  return (
    <div className="input-container">
      <label>
        {props.title}
        <input type="number" defaultValue={props.defaultValue} step={props.step ?? 0.01} min={props.min} max={props.max}
          placeholder={props.placeholder} onChange={(e) => {
            e.defaultPrevented = true;
            debouncedChange(Number(e.target.value));
          }} />
      </label>
    </div>
  );
};
