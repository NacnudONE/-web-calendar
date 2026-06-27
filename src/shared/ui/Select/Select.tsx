import React from 'react'
import classNames from 'classnames'
import styles from './Select.module.scss'

type SelectProps = {
  label?: string
  wrapperClassName?: string
  bare?: boolean
} & React.SelectHTMLAttributes<HTMLSelectElement>

const Select = ({ label, wrapperClassName, bare, className, children, ...rest }: SelectProps) => (
  <label className={classNames(styles.wrapper, wrapperClassName)}>
    {label && <span className={styles.label}>{label}</span>}
    <select className={classNames(styles.select, { [styles.bare]: bare }, className)} {...rest}>
      {children}
    </select>
  </label>
)

export default Select
