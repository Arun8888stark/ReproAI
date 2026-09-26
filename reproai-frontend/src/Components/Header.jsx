import { FiMenu } from "react-icons/fi";

function Header({ title, subtitle, icon: Icon, actions, onMenu }) {
  return (
    <header className="page-header">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu"><FiMenu /></button>
      {Icon && <span className="header-icon"><Icon /></span>}
      <div className="header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}

export default Header;
