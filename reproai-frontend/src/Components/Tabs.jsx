function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <button key={id} role="tab" aria-selected={active === id} className={active === id ? "tab tab-active" : "tab"} onClick={() => onChange(id)}>
          {Icon && <Icon />}
          {label}
          {count != null && <span className="tab-count">{count}</span>}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
