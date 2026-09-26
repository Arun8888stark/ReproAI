import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiArrowRight } from "react-icons/fi";

function Screenshots({ screenshots = [], small = false }) {
  const [index, setIndex] = useState(null);
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, screenshots.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, screenshots.length]);

  if (!screenshots.length) return <p className="muted">No screenshots yet.</p>;
  const current = open ? screenshots[index] : null;

  return (
    <>
      <div className="shots">
        {screenshots.map((s, i) => (
          <div key={s.order} className="shot-wrap">
            <button className={`shot ${small ? "shot-small" : ""} ${s.isFailure ? "shot-fail" : ""}`} onClick={() => setIndex(i)}>
              <img src={s.url} alt={s.label} loading="lazy" />
              <span>{s.order}. {s.label}</span>
            </button>
            {i < screenshots.length - 1 && <FiArrowRight className="shot-arrow" />}
          </div>
        ))}
      </div>

      {current && (
        <div className="lightbox" onClick={() => setIndex(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={current.url} alt={current.label} />
            <div className="lightbox-bar">
              <button className="icon-btn" onClick={() => setIndex(Math.max(index - 1, 0))} disabled={index === 0} aria-label="Previous"><FiChevronLeft /></button>
              <span className={current.isFailure ? "lb-fail" : ""}>Step {current.order} of {screenshots.length}: {current.label}</span>
              <button className="icon-btn" onClick={() => setIndex(Math.min(index + 1, screenshots.length - 1))} disabled={index === screenshots.length - 1} aria-label="Next"><FiChevronRight /></button>
              <button className="icon-btn" onClick={() => setIndex(null)} aria-label="Close"><FiX /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Screenshots;
