import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <div>
      <header className="bg-ozford-primary text-white py-5 px-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ozford-accent rounded-xl flex items-center justify-center shadow-md shadow-ozford-accent/40">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-widest uppercase">
              OSZFORD
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="bg-white/10 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer text-white">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
