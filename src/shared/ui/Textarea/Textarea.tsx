import React from 'react'
import classNames from 'classnames'
import styles from './Textarea.module.scss'

type TextareaProps = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  label?: string
  rows?: number
  className?: string
}

const Textarea= ({
  value,
  onChange,
  placeholder,
  disabled = false,
  label,
  rows = 4,
  className,
}: TextareaProps) => (
  <label className={styles.wrapper}>
    {label && <span className={styles.label}>{label}</span>}
    <textarea
      className={classNames(
        styles.textarea,
        { [styles.disabled]: disabled },
        className,
      )}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
    />
  </label>
)

export default Textarea
