import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children, ...header }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="layout">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main className="main">
        <Header {...header} onMenu={() => setOpen(true)} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
