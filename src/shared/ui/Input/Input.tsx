import React from 'react'
import classNames from 'classnames'
import styles from './Input.module.scss'

type InputProps = {
  label?: string
  wrapperClassName?: string
  bare?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>

const Input = ({ label, wrapperClassName, bare, className, ...rest }: InputProps) => (
  <label className={classNames(styles.wrapper, wrapperClassName)}>
    {label && <span className={styles.label}>{label}</span>}
    <input
      className={classNames(styles.input, { [styles.bare]: bare }, className)}
      {...rest}
    />
  </label>
)

export default Input
