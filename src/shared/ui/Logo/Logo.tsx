import React from 'react'
import classNames from 'classnames'
import styles from './Logo.module.scss'

export const Logo = () => {
  return (
    <div className={styles.logo}>
      <div className={styles.diamonds}>
        <div className={classNames(styles.diamond, styles.diamondBack)} />
        <div className={classNames(styles.diamond, styles.diamondFront)} />
      </div>
      <span className={styles.text}>WebCalendar</span>
    </div>
  )
}
