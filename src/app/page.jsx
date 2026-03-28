import React from "react";
import Link from "next/link";

export default function HomePrimary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ozford-bg font-sans selection:bg-ozford-accent selection:text-white p-4">
      <div className="bg-ozford-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-white/10 text-center max-w-lg w-full relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ozford-primary to-ozford-accent"></div>

        <div className="w-20 h-20 bg-ozford-accent rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-ozford-accent/40 mb-8 border border-white/20">
          <svg
            className="w-10 h-10 text-white"
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

        <h1 className="text-4xl font-extrabold text-ozford-title mb-4 tracking-tight">
          Bienvenido a OSZFORD
        </h1>
        <p className="text-ozford-text text-lg mb-10 leading-relaxed">
          Sistema E.S.C.U.D.O. AZUL de inspección preoperacional.
        </p>

        <Link
          href="/rColaborador"
          className="w-full bg-ozford-accent hover:bg-ozford-primary text-white font-bold py-4 px-8 rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group text-lg"
        >
          Iniciar Turno / Registro
          <svg
            className="w-6 h-6 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
