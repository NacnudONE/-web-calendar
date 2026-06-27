import React from 'react'
import styles from "./ColorPicker.module.scss";

type ColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}


export const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
  return (
      <>
        <div className={styles.colorPicker}>
          {label && <label className={styles.label}>{label}</label>}
          <div className={styles.inputWrapper}>
            <input
              type="color"
              value ={value}
              onChange={(e) => onChange(e.target.value)}
            />
            <div
            className={styles.preview}
            style={{ backgroundColor: value }}
            title={value}
            />
          </div>
        </div>
      </>
  )

}
