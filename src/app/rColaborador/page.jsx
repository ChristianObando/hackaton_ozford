"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buscarColaboradorPorDocumento, registrarColaborador } from "@/app/server/cColaborador";

export default function RegistroColaborador() {
  const router = useRouter();

  // State variables for the two-step flow
  const [step, setStep] = useState(1);
  const [documento, setDocumento] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [nombre, setNombre] = useState("");
  const [area, setArea] = useState("");
  const [licencias, setLicencias] = useState([{ id: Date.now(), tipo: "", vigencia: "" }]);

  // Step 1: Verify document
  const handleVerificarDocumento = async (e) => {
    e.preventDefault();
    if (!documento) return;

    setIsVerifying(true);
    setMessage("");

    try {
      const colaboradorExistente = await buscarColaboradorPorDocumento(documento);

      if (colaboradorExistente) {
        // Document found -> registered -> jump to RVehiculo
        localStorage.setItem('colaborador_id', documento);
        router.push("/rVehiculo");
      } else {
        // Not found -> ask for details -> next step
        setMessage("Documento no encontrado. Por favor, complete su registro inicial.");
        setStep(2);
      }
    } catch (error) {
      console.error("Error al verificar:", error);
      setMessage("Error al verificar el documento. Intente de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2 (if not registered): Finalize registration
  const handleRegistroFinal = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const payload = {
        nombre,
        documento,
        area,
        licencias: licencias.map(l => ({ tipo: l.tipo, vigencia: l.vigencia }))
      };

      await registrarColaborador(payload);
      localStorage.setItem('colaborador_id', documento);
      router.push("/rVehiculo");
    } catch (error) {
      console.error("Error al registrar:", error);
      setMessage(error.message || "Error al registrar el colaborador.");
    } finally {
      setIsVerifying(false);
    }
  };

  const addLicencia = () => {
    setLicencias([...licencias, { id: Date.now(), tipo: "", vigencia: "" }]);
  };

  const removeLicencia = (id) => {
    if (licencias.length > 1) {
      setLicencias(licencias.filter((l) => l.id !== id));
    }
  };

  const updateLicencia = (id, field, value) => {
    setLicencias(
      licencias.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  return (
    <div className="min-h-screen bg-ozford-bg font-sans selection:bg-ozford-accent selection:text-white pb-10">
      <main className="max-w-3xl mx-auto px-4 mt-8 md:mt-12">
        {/* Header Section */}
        <div className="bg-ozford-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/10 text-center mb-8 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-ozford-primary to-ozford-accent"></div>

          <h2 className="text-3xl font-extrabold text-ozford-title mb-3">
            {step === 1 ? "Verificación de Ingreso" : "Completar Registro"}
          </h2>
          <p className="text-ozford-text text-lg max-w-2xl mx-auto leading-relaxed">
            {step === 1
              ? "Por favor, ingrese su número de documento para verificar si ya está registrado en la plataforma."
              : "Ingrese sus datos personales para finalizar el registro y continuar con la inspección de su vehículo."}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-ozford-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-white/10 transition-all duration-500">

          {step === 1 ? (
            /* STEP 1: SOLICITAR DOCUMENTO */
            <form onSubmit={handleVerificarDocumento} className="space-y-6 animate-fade-in">
              <div>
                <label htmlFor="documento-verificacion" className="block text-sm font-bold text-ozford-title mb-2">
                  Número de Documento (Cédula)
                </label>
                <input
                  type="number"
                  id="documento-verificacion"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="w-full bg-ozford-bg border border-gray-200 dark:border-white/10 rounded-xl px-4 py-4 text-lg text-center tracking-widest text-ozford-text focus:outline-none focus:ring-2 focus:ring-ozford-accent focus:border-transparent transition-all"
                  placeholder="Ej. 1020304050"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isVerifying || !documento}
                  className="w-full sm:w-auto min-w-[200px] bg-ozford-accent hover:bg-ozford-primary disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    <>
                      Verificar Ingreso
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: FORMULARIO COMPLETO */
            <form onSubmit={handleRegistroFinal} className="space-y-8 animate-fade-in">
              <div className="space-y-6">

                {message && (
                  <div className="bg-blue-50 dark:bg-ozford-accent/10 border-l-4 border-ozford-accent p-4 rounded-r-xl">
                    <p className="text-ozford-primary dark:text-gray-200 text-sm font-medium">{message}</p>
                  </div>
                )}

                {/* Documento (Solo lectura, ya que lo ingresó en el paso 1) */}
                <div>
                  <label htmlFor="documento" className="block text-sm font-bold text-ozford-title mb-2">
                    Número de Documento (Cédula)
                  </label>
                  <input
                    type="number"
                    id="documento"
                    value={documento}
                    readOnly
                    className="w-full bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-1 text-xs text-ozford-accent hover:underline font-medium"
                  >
                    ¿Desea cambiar de documento?
                  </button>
                </div>

                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-bold text-ozford-title mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-ozford-bg border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-ozford-text focus:outline-none focus:ring-2 focus:ring-ozford-accent focus:border-transparent transition-all"
                    placeholder="Ej. Juan Pérez"
                    required
                    autoFocus
                  />
                </div>

                {/* Área */}
                <div>
                  <label htmlFor="area" className="block text-sm font-bold text-ozford-title mb-2">
                    Área o Dependencia
                  </label>
                  <div className="relative">
                    <select
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-ozford-bg border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-ozford-text focus:outline-none focus:ring-2 focus:ring-ozford-accent focus:border-transparent transition-all appearance-none"
                      required
                    >
                      <option value="">Seleccione su área...</option>
                      <option value="operaciones">Operaciones</option>
                      <option value="logistica">Logística</option>
                      <option value="seguridad">Seguridad</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="otro">Otro</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ozford-text">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-white/10" />

              {/* Licencias dinámicas */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-ozford-title">Información de Licencias</h3>
                </div>

                <div className="space-y-6">
                  {licencias.map((licencia, index) => (
                    <div key={licencia.id} className="p-5 bg-ozford-bg rounded-2xl border border-gray-100 dark:border-white/5 relative group transition-all duration-300">
                      {/* Botón de eliminar (solo visible si hay más de 1 licencia) */}
                      {licencias.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLicencia(licencia.id)}
                          className="absolute -top-3 -right-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full hover:bg-red-200 shadow-sm transition-colors focus:outline-none"
                          title="Eliminar esta licencia"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tipo de Licencia */}
                        <div>
                          <label className="block text-sm font-bold text-ozford-title mb-2">
                            Categoría <span className="text-ozford-accent">#{index + 1}</span>
                          </label>
                          <div className="relative">
                            <select
                              value={licencia.tipo}
                              onChange={(e) => updateLicencia(licencia.id, "tipo", e.target.value)}
                              className="w-full bg-ozford-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-ozford-text focus:outline-none focus:ring-2 focus:ring-ozford-accent focus:border-transparent transition-all appearance-none"
                              required
                            >
                              <option value="">Seleccione categoría...</option>
                              <option value="A1">A1 (Motocicletas hasta 125cc)</option>
                              <option value="A2">A2 (Motocicletas más de 125cc)</option>
                              <option value="B1">B1 (Automóviles particulares)</option>
                              <option value="B2">B2 (Camiones rígidos particulares)</option>
                              <option value="B3">B3 (Vehículos articulados particulares)</option>
                              <option value="C1">C1 (Automóviles públicos)</option>
                              <option value="C2">C2 (Camiones rígidos públicos)</option>
                              <option value="C3">C3 (Vehículos articulados públicos)</option>
                              <option value="N/A">No Aplica / Sin Licencia</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ozford-text">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Vigencia de la Licencia */}
                        <div>
                          <label className="block text-sm font-bold text-ozford-title mb-2">
                            Vigencia
                          </label>
                          <input
                            type="date"
                            value={licencia.vigencia}
                            onChange={(e) => updateLicencia(licencia.id, "vigencia", e.target.value)}
                            className="w-full bg-ozford-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-ozford-text focus:outline-none focus:ring-2 focus:ring-ozford-accent focus:border-transparent transition-all"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botón Agregar Licencia */}
                <button
                  type="button"
                  onClick={addLicencia}
                  className="mt-4 flex items-center gap-2 text-ozford-accent hover:text-ozford-primary dark:hover:text-white font-bold text-sm px-4 py-2 rounded-xl border border-dashed border-ozford-accent hover:bg-ozford-accent/10 transition-colors w-full sm:w-auto justify-center"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar otra licencia
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-ozford-accent hover:bg-ozford-primary text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  Finalizar Registro
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
