import React from 'react'
import classNames from 'classnames'
import styles from './IconButton.module.scss'

type IconButtonProps = {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  title?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const IconButton = ({
  children,
  className,
  style: styleProp,
  title,
  disabled = false,
  type = 'button',
  onClick,
}: IconButtonProps) => (
  <button
    type={type}
    className={classNames(styles.iconButton, className)}
    style={styleProp}
    title={title}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
)

export default IconButton
