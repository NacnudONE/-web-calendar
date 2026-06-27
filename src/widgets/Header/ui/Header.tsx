import React, { useState, useRef } from 'react'
import classNames from 'classnames'
import { ChevronLeft, ChevronRight, ChevronDown, LogOut } from 'lucide-react'
import { useClickOutside } from '../../../shared/lib'
import { Logo } from '../../../shared/ui'
import { useAuthStore } from '../../../features/auth'
import { SearchBar } from '../../../features/SearchBar'
import type { CalendarEvent } from '../../../entities/calendar'
import styles from './Header.module.scss'

export type ViewMode = 'day' | 'week' | 'month'

const VIEW_LABELS: Record<ViewMode, string> = { day: 'Day', week: 'Week', month: 'Month' }

interface HeaderProps {
  view: ViewMode
  displayDate: string
  onViewChange: (view: ViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onEventSelect: (event: CalendarEvent) => void
}

export const Header = ({ view, displayDate, onViewChange, onPrev, onNext, onToday, onEventSelect }: HeaderProps) => {
  const { user, logout } = useAuthStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const viewDropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setDropdownOpen(false), dropdownOpen)
  useClickOutside(viewDropdownRef, () => setViewDropdownOpen(false), viewDropdownOpen)

  return (
    <header className={styles.header}>
      <Logo />

      <div className={styles.center}>
        <button type="button" className={styles.navBtnToday} onClick={onToday}>Today</button>
        <button type="button" className={styles.navBtn} onClick={onPrev}>
          <ChevronLeft size={16} stroke="#323749" />
        </button>
        <button type="button" className={styles.navBtn} onClick={onNext}>
          <ChevronRight size={16} stroke="#323749" />
        </button>
        <h1 className={styles.date}>{displayDate}</h1>
      </div>

      <div className={styles.search}>
        <SearchBar onEventSelect={onEventSelect} />
      </div>

      <div className={styles.right}>
        <div className={styles.viewSwitcher} ref={viewDropdownRef}>
          <button type="button" className={styles.viewBtn} onClick={() => setViewDropdownOpen(o => !o)}>
            <span>{VIEW_LABELS[view]}</span>
            <ChevronDown size={14} stroke="#323749" />
          </button>
          {viewDropdownOpen && (
            <div className={styles.viewDropdown}>
              {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  className={classNames(styles.viewDropdownItem, { [styles.viewDropdownItemActive]: view === v })}
                  onClick={() => { onViewChange(v); setViewDropdownOpen(false) }}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.userInfo} ref={dropdownRef}>
          <span className={styles.userName}>{user?.name}</span>
          <button type="button" className={styles.avatarBtn} onClick={() => setDropdownOpen(o => !o)}>
            {user?.picture
              ? <img src={user.picture} alt={user.name} width={40} height={40} style={{ objectFit: 'cover' }} />
              : user?.name[0]
            }
          </button>
          {dropdownOpen && (
            <div className={styles.userDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownName}>{user?.name}</div>
                <div className={styles.dropdownEmail}>{user?.email}</div>
              </div>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => { setDropdownOpen(false); void logout() }}
              >
                <LogOut size={16} />
                Вийти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
