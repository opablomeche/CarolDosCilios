'use client'

import { useState } from 'react'
import { DatePreset, DateRange } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import DateRangePicker from './DateRangePicker'

interface HeaderProps {
  preset: DatePreset
  customRange: DateRange
  updatedAt?: string
  onPresetChange: (p: DatePreset) => void
  onCustomRangeChange: (r: DateRange) => void
}

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today',     label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: 'last_7d',   label: 'Últimos 7 dias' },
  { value: 'custom',    label: 'Personalizado' },
]

export default function Header({
  preset, customRange, updatedAt, onPresetChange, onCustomRangeChange,
}: HeaderProps) {
  const [showCustom,  setShowCustom]  = useState(false)
  const [pickerOpen,  setPickerOpen]  = useState(false)

  function handlePreset(p: DatePreset) {
    onPresetChange(p)
    const isCustom = p === 'custom'
    setShowCustom(isCustom)
    if (isCustom) setPickerOpen(true)
    else setPickerOpen(false)
  }

  const lastUpdate = updatedAt
    ? format(new Date(updatedAt), "dd/MM 'às' HH:mm", { locale: ptBR })
    : null

  const displayRange = customRange.start && customRange.end
    ? `${format(new Date(customRange.start + 'T12:00:00'), 'dd/MM')} → ${format(new Date(customRange.end + 'T12:00:00'), 'dd/MM')}`
    : 'Selecionar datas'

  return (
    <header
      className="flex items-center justify-between gap-4 flex-shrink-0"
      style={{
        background: '#080808',
        borderBottom: '1px solid var(--border-subtle)',
        height: '52px',
        padding: '0 24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-body" style={{ fontSize: '12px', color: 'var(--muted)' }}>
        <span>Meta Ads</span>
        <span style={{ color: 'var(--border)' }}>›</span>
        <span style={{ color: 'var(--muted-light)' }}>
          {process.env.NEXT_PUBLIC_CAMPAIGN_LABEL ?? 'VR-MAI-2026'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Preset buttons */}
        <div className="flex items-center gap-1">
          {PRESETS.map((p) => {
            const isActive = preset === p.value
            return (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                className="font-body transition-all duration-150"
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 400,
                  borderRadius: '3px',
                  border: isActive ? '1px solid var(--white)' : '1px solid var(--border)',
                  color: isActive ? 'var(--white)' : 'var(--muted)',
                  background: isActive ? 'var(--surface-2)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>

        {/* Custom range trigger + calendar */}
        {showCustom && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPickerOpen(o => !o)}
              className="font-body"
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                background: pickerOpen ? 'var(--surface-2)' : 'var(--surface-1)',
                color: 'var(--cream)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {displayRange}
            </button>

            {pickerOpen && (
              <DateRangePicker
                value={customRange}
                onChange={(r) => { onCustomRangeChange(r); setPickerOpen(false) }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        )}

        {/* Last update */}
        {lastUpdate && (
          <div className="flex items-center gap-2 font-body" style={{ fontSize: '11px', fontWeight: 300, color: 'var(--muted)' }}>
            <span
              className="rounded-full animate-pulse-dot"
              style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--white)' }}
            />
            {lastUpdate}
          </div>
        )}
      </div>
    </header>
  )
}
