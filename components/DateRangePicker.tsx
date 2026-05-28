'use client'

import { useState, useEffect, useRef } from 'react'
import { DateRange } from '@/types'
import {
  format, addMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isWithinInterval,
  differenceInDays, addDays, isBefore, isAfter,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  value: DateRange
  onChange: (r: DateRange) => void
  onClose: () => void
}

const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MAX_DAYS = 6 // inclusive → 7 dias no total

function buildDays(month: Date): (Date | null)[] {
  const start = startOfMonth(month)
  const end   = endOfMonth(month)
  const cells: (Date | null)[] = []

  for (let i = 0; i < start.getDay(); i++) cells.push(null)
  for (const d of eachDayOfInterval({ start, end })) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function DateRangePicker({ value, onChange, onClose }: Props) {
  const [leftMonth,   setLeftMonth]   = useState(() => startOfMonth(new Date()))
  const [pendingStart, setPendingStart] = useState<Date | null>(null)
  const [hover,        setHover]       = useState<Date | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const rightMonth = addMonths(leftMonth, 1)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [onClose])

  function handleDayClick(day: Date) {
    if (!pendingStart) {
      setPendingStart(day)
      return
    }

    let start = pendingStart
    let end   = day

    if (isAfter(start, end)) [start, end] = [end, start]
    if (differenceInDays(end, start) > MAX_DAYS) end = addDays(start, MAX_DAYS)

    onChange({ start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') })
    onClose()
  }

  function isBlocked(day: Date): boolean {
    if (!pendingStart) return false
    return Math.abs(differenceInDays(day, pendingStart)) > MAX_DAYS
  }

  function isInPreviewRange(day: Date): boolean {
    if (!pendingStart || !hover) return false
    const [s, e] = isBefore(pendingStart, hover) ? [pendingStart, hover] : [hover, pendingStart]
    const safeE  = differenceInDays(e, s) > MAX_DAYS ? addDays(s, MAX_DAYS) : e
    return isWithinInterval(day, { start: s, end: safeE })
  }

  function isRangeStart(day: Date) { return pendingStart ? isSameDay(day, pendingStart) : false }
  function isRangeEnd(day: Date)   { return pendingStart && hover && !isSameDay(pendingStart, hover) ? isSameDay(day, hover) : false }

  const displayStart = pendingStart ? format(pendingStart, 'dd/MM/yyyy') : '—'
  const displayEnd   = (() => {
    if (!pendingStart || !hover) return '—'
    const [s, e] = isBefore(pendingStart, hover) ? [pendingStart, hover] : [hover, pendingStart]
    const safeE  = differenceInDays(e, s) > MAX_DAYS ? addDays(s, MAX_DAYS) : e
    return format(safeE, 'dd/MM/yyyy')
  })()

  function renderMonth(month: Date) {
    const days = buildDays(month)
    return (
      <div style={{ width: '196px' }}>
        <p className="font-body" style={{ textAlign: 'center', fontSize: '11px', fontWeight: 400, color: 'var(--cream)', marginBottom: '8px', textTransform: 'capitalize' }}>
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="font-body" style={{ textAlign: 'center', fontSize: '9px', color: 'var(--muted)', padding: '2px 0', letterSpacing: '0.04em' }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
          {days.map((day, i) => {
            if (!day) return <div key={i} />

            const blocked  = isBlocked(day)
            const inRange  = isInPreviewRange(day)
            const isStart  = isRangeStart(day)
            const isEnd    = isRangeEnd(day)
            const selected = isStart || isEnd
            const today    = isSameDay(day, new Date())

            return (
              <button
                key={i}
                onClick={() => !blocked && handleDayClick(day)}
                onMouseEnter={() => !blocked && setHover(day)}
                onMouseLeave={() => setHover(null)}
                style={{
                  padding: '5px 1px',
                  textAlign: 'center',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontFamily: '"DM Sans", system-ui',
                  fontWeight: selected ? 600 : 400,
                  cursor: blocked ? 'not-allowed' : 'pointer',
                  border: today && !selected ? '1px solid var(--border)' : '1px solid transparent',
                  background: selected ? 'var(--white)' : inRange ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: selected ? '#000' : blocked ? 'var(--border)' : today ? 'var(--gold)' : 'var(--cream)',
                  transition: 'background 80ms',
                }}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        width: 'min(460px, calc(100vw - 16px))',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
      }}
    >
      {/* Month navigation + calendars */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => setLeftMonth(m => addMonths(m, -1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-light)', padding: '4px 6px', fontSize: '13px', alignSelf: 'center', borderRadius: '3px' }}
        >
          ←
        </button>

        <div className="flex gap-5">
          {renderMonth(leftMonth)}
          <div className="picker-second-month">{renderMonth(rightMonth)}</div>
        </div>

        <button
          onClick={() => setLeftMonth(m => addMonths(m, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-light)', padding: '4px 6px', fontSize: '13px', alignSelf: 'center', borderRadius: '3px' }}
        >
          →
        </button>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-center gap-3 font-body"
        style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: '12px', fontSize: '11px', color: 'var(--muted-light)' }}
      >
        <span style={{ color: pendingStart ? 'var(--white)' : 'var(--muted)' }}>{displayStart}</span>
        <span style={{ color: 'var(--muted)' }}>→</span>
        <span style={{ color: displayEnd !== '—' ? 'var(--white)' : 'var(--muted)' }}>{displayEnd}</span>
        <span style={{ color: 'var(--muted)', fontWeight: 300, fontSize: '10px' }}>
          {!pendingStart ? '· clique para definir início' : '· clique para definir fim (máx 7 dias)'}
        </span>
      </div>
    </div>
  )
}
