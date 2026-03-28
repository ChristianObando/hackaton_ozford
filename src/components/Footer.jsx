export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-ozford-primary text-white/80 py-8 px-4 mt-auto border-t border-white/5 shrink-0 z-10 w-full relative">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-ozford-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-extrabold text-white tracking-widest uppercase text-sm">
            OSZFORD
          </span>
        </div>
        
        <div className="text-center md:text-right">
          <p className="text-sm font-medium">© {currentYear} Sistema E.S.C.U.D.O. AZUL.</p>
          <p className="text-xs text-white/50 mt-1.5 flex items-center justify-center md:justify-end gap-1.5">
            Inspección Preoperacional de Vehículos
            <svg className="w-3 h-3 text-ozford-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </p>
        </div>

      </div>
    </footer>
  );
}
