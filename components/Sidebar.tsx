'use client'

import { ActiveTab } from '@/types'

interface SidebarProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

const NAV: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/>
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/>
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/>
        <rect x="9" y="9" width="5.5" height="5.5" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'campaigns',
    label: 'Campanhas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <line x1="2" y1="4" x2="14" y2="4"/>
        <line x1="2" y1="8" x2="14" y2="8"/>
        <line x1="2" y1="12" x2="9"  y2="12"/>
      </svg>
    ),
  },
  {
    id: 'creatives',
    label: 'Criativos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1"/>
        <path d="M6.5 6.5l4 2-4 2V6.5z" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex w-[220px] shrink-0 flex-col h-screen sticky top-0"
      style={{ background: '#080808', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Brand */}
      <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <img
          src="/ak-logo.png"
          alt="AK Media"
          className="w-10 h-10 object-contain mb-3"
        />
        <p
          className="font-display leading-none mb-1"
          style={{ fontSize: '13px', color: 'var(--muted-light)', fontWeight: 400 }}
        >
          AK Media
        </p>
        <p
          className="font-body leading-none"
          style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}
        >
          {process.env.NEXT_PUBLIC_CLIENT_NAME ?? 'Carol dos Cílios'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 transition-all duration-150"
              style={{
                padding: '10px 20px',
                paddingLeft: isActive ? '18px' : '20px',
                borderLeft: isActive
                  ? '2px solid var(--white)'
                  : '2px solid transparent',
                background: isActive ? 'var(--surface-2)' : 'transparent',
                color: isActive ? 'var(--white)' : 'var(--muted)',
                fontSize: '13px',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 400,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--cream)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--muted)'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p className="font-body" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 300 }}>
          Meta Ads API v19
        </p>
      </div>
    </aside>
  )
}
