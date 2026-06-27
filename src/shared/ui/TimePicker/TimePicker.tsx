import React, { useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import { useClickOutside, to24, toDisplay } from '../../../shared/lib'
import styles from './TimePicker.module.scss'

const TIMES: string[] = []
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIMES.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
}

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const TimePicker = ({ value, onChange, className }: Props) => {
  const [open, setOpen] = useState(false)
  const [inputVal, setInputVal] = useState(toDisplay(value))
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setInputVal(toDisplay(value)) }, [value])

  useClickOutside([wrapperRef, listRef], () => setOpen(false), open)

  useEffect(() => {
    if (!open) return
    const idx = TIMES.indexOf(value)
    if (idx !== -1 && listRef.current) {
      const item = listRef.current.children[idx] as HTMLElement
      item?.scrollIntoView({ block: 'center' })
    }
  }, [open, value])

  const openDropdown = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(true)
  }

  const handleBlur = () => {
    const normalized = to24(inputVal)
    if (normalized) {
      onChange(normalized)
      setInputVal(toDisplay(normalized))
    } else {
      setInputVal(toDisplay(value))
    }
    setTimeout(() => setOpen(false), 150)
  }

  const handleSelect = (t: string) => {
    onChange(t)
    setInputVal(toDisplay(t))
    setOpen(false)
  }

  return (
    <div className={classNames(styles.wrapper, className)} ref={wrapperRef}>
      <input
        ref={inputRef}
        className={styles.input}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onFocus={openDropdown}
        onBlur={handleBlur}
      />
      {open && (
        <ul
          ref={listRef}
          className={styles.dropdown}
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          {TIMES.map((t) => (
            <li
              key={t}
              className={classNames(styles.option, { [styles.optionActive]: t === value })}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(t) }}
            >
              {toDisplay(t)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
