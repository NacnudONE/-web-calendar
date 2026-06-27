import React, { useState } from 'react'
import classNames from 'classnames'
import { useAuthStore } from '../../../features/auth'
import styles from './LoginPage.module.scss'

const GoogleIcon = () => {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export const LoginPage = () => {
  const { login } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await login()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Login error:', err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.decoration}>
          <div className={styles['decor-circle']} />
          <div className={styles['decor-circle']} />
          <div className={styles['decor-circle']} />
        </div>

        <div className={styles.leftContent}>
          <div className={styles.logoLarge}>
            <div className={styles.logoDiamonds}>
              <div className={classNames(styles.logoDiamond, styles.logoDiamondBack)} />
              <div className={classNames(styles.logoDiamond, styles.logoDiamondFront)} />
            </div>
            <span className={styles.logoText}>WebCalendar</span>
          </div>

          <p className={styles.tagline}>
            Плануй свій час розумно
          </p>
          <p className={styles.taglineSub}>
            Зручний веб-календар для організації подій,<br />
            нагадувань та щоденного розкладу.
          </p>
        </div>
      </div>

      <div className={styles.right}>
        <h1 className={styles.formTitle}>Ласкаво просимо</h1>
        <p className={styles.formSubtitle}>
          Увійдіть за допомогою Google,<br />щоб продовжити до свого календаря
        </p>

        <div className={styles.divider}>або</div>

        <button
          className={styles.googleBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          {loading ? 'Завантаження...' : 'Увійти через Google'}
        </button>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <p className={styles.footer}>
          Використовуючи WebCalendar, ви погоджуєтесь<br />
          з умовами використання та політикою конфіденційності.
        </p>
      </div>
    </div>
  )
}
