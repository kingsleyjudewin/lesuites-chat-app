export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className={`glass-panel rounded-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} p-panel-padding relative max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors" onClick={onClose} type="button">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h3 className="font-headline-lg text-headline-lg mb-6">{title}</h3>
        {children}
