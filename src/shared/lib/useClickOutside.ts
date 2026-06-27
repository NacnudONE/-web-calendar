import { type RefObject, useEffect } from 'react'

type AnyRef = RefObject<Element | null>

export const useClickOutside = (
  refs: AnyRef | AnyRef[],
  callback: () => void,
  enabled = true,
) => {
  useEffect(() => {
    if (!enabled) return
    const refArray = Array.isArray(refs) ? refs : [refs]
    const handler = (e: MouseEvent) => {
      const isOutside = refArray.every(ref => !ref.current?.contains(e.target as Node))
      if (isOutside) callback()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [enabled])
}
