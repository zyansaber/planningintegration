import React from 'react';

const AppSidebar = ({ activePage, isCollapsed, onToggleCollapse, onNavigate, items }) => (
  <aside
    className={`hidden h-screen flex-shrink-0 flex-col border-r border-[#2a2a2a] bg-[#1f1f1f] text-[#ececec] transition-all duration-200 md:flex ${
      isCollapsed ? 'w-[130px]' : 'w-[200px]'
    }`}
  >
    <div className="border-b border-white/10 px-3 py-4">
      <div className="flex items-center justify-between gap-2">
        {!isCollapsed && (
          <>
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Workspace</p>
            <h2 className="text-sm font-semibold text-zinc-100">Planning</h2>
          </>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-md border border-white/20 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10"
        >
          {isCollapsed ? 'Expand' : 'Icons'}
        </button>
      </div>
    </div>

    <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.path}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(item);
          }}
          className={`flex items-center rounded-md px-2 py-2 text-xs transition-colors ${
            activePage === item.id
              ? 'bg-[#2d2d2d] text-white'
              : 'text-zinc-300 hover:bg-[#272727] hover:text-white'
          } ${isCollapsed ? 'justify-center gap-0' : 'gap-2'}`}
          title={item.name}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
          </svg>
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </a>
      ))}
    </nav>
  </aside>
);

export default AppSidebar;
