"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  buscarVehiculoPorPlaca,
  registrarVehiculo,
} from "@/app/server/cVehiculo";
import CameraCapture from "@/components/CameraCapture";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [fechaSoat, setFechaSoat] = useState("");
  const [fechaTecno, setFechaTecno] = useState("");
  const [fechaImpuesto, setFechaImpuesto] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [pendingVehiculo, setPendingVehiculo] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const tiposVehiculos = [
    { id: "moto", title: "Motocicletas", icon: "🏍️" },
    { id: "bicicleta", title: "Bicicletas", icon: "🚲" },
    { id: "patineta", title: "Patinetas", icon: "🛴" },
    { id: "moto_electrica", title: "Motos Eléctricas", icon: "⚡" },
  ];

  const handleVerificarPlaca = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const vehiculo = await buscarVehiculoPorPlaca(placa);
      if (vehiculo) {
        // Verificar fechas de vencimiento
        const hoy = new Date();
        const limite = new Date();
        limite.setDate(hoy.getDate() + 15); // Alerta si vence en menos de 15 días

        const warnings = [];
        if (vehiculo.fechaSoat && new Date(vehiculo.fechaSoat) <= limite) {
          warnings.push({
            title: "SOAT Próximo a Vencer comuniquese con su supervisor",
            date: vehiculo.fechaSoat,
            icon: "📄",
          });
        }
        if (vehiculo.fechaTecno && new Date(vehiculo.fechaTecno) <= limite) {
          warnings.push({
            title: "Tecnomecánica Próxima a Vencer comuniquese con su supervisor",
            date: vehiculo.fechaTecno,
            icon: "🛠️",
          });
        }
        if (
          vehiculo.fechaImpuesto &&
          new Date(vehiculo.fechaImpuesto) <= limite
        ) {
          warnings.push({
            title: "Impuesto Próximo a Vencer comuniquese con su supervisor",
            date: vehiculo.fechaImpuesto,
            icon: "💰",
          });
        }

        if (warnings.length > 0) {
          setAlerts(warnings);
          setPendingVehiculo(vehiculo);
          // No redirigimos, mostramos las alertas primero
        } else {
          localStorage.setItem("vehiculo_placa", placa);
          router.push(`/inspeccion/${vehiculo.tipo}`);
        }
      } else {
        setMessage("Vehículo no registrado. Por favor, regístrelo.");
        setStep(2);
      }
    } catch (error) {
      setMessage("Error al verificar la placa.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConsultarLegal = () => {
    // Simulamos una consulta a base de datos externa tipo RUNT/SOAT
    setIsVerifying(true);
    setTimeout(() => {
      const hoy = new Date();
      const proximoAño = new Date();
      proximoAño.setFullYear(hoy.getFullYear() + 1);
      const fechaMock = proximoAño.toISOString().split("T")[0];

      setFechaSoat(fechaMock);
      setFechaTecno(fechaMock);
      setFechaImpuesto(fechaMock);
      setMarca("Honda CB190R"); // Ejemplo de data consultada
      setMessage("Información legal y marca consultada exitosamente.");
      setIsVerifying(false);
    }, 1500);
  };

  const handleCapture = (blob) => {
    if (blob) {
      const file = new File([blob], `vehiculo_${placa}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowCamera(false);
    }
  };

  const handleRegistroVehiculo = async (tipoId) => {
    setIsVerifying(true);
    let uploadedUrl = "";

    try {
      if (!placa || !marca) {
        setMessage("Por favor complete placa y marca.");
        return;
      }

      // 1. Subir imagen si existe
      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/cargaImagenes", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Error al subir imagen");
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
        setIsUploading(false);
      }

      // 2. Registrar vehículo con el enlace de la imagen
      await registrarVehiculo({
        placa,
        marca: marca || "Genérica",
        tipo: tipoId,
        fechaSoat,
        fechaTecno,
        fechaImpuesto,
        enlace_foto: uploadedUrl,
      });

      setMessage("¡Vehículo registrado con éxito!");
      // Regresar al menu de inicio de vehiculos tras 2 segundos
      setTimeout(() => {
        setStep(1);
        setPlaca("");
        setMarca("");
        setFechaSoat("");
        setFechaTecno("");
        setFechaImpuesto("");
        setImageFile(null);
        setPreviewUrl("");
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage("Error al registrar vehículo: " + error.message);
    } finally {
      setIsVerifying(false);
      setIsUploading(false);
    }
  };

  const handleProceedToInspeccion = () => {
    if (pendingVehiculo) {
      localStorage.setItem("vehiculo_placa", pendingVehiculo.placa);
      router.push(`/inspeccion/${pendingVehiculo.tipo}`);
    }
  };

  return (
    <div className="min-h-screen bg-ozford-bg dark:bg-gray-900 p-4 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border dark:border-gray-700 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Inspección Preoperacional
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Verificación de seguridad de su vehículo.
          </p>
        </div>

        {/* ALERTAS DE VENCIMIENTO */}
        {alerts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-amber-400 dark:border-amber-500 mb-8 animate-bounce-subtle">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-2xl text-amber-600 dark:text-amber-400 text-3xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">
                  Alertas de Documentación
                </h3>
                <p className="text-gray-500 dark:text-gray-300 font-medium">
                  Se han detectado documentos próximos a vencer o vencidos.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-100 dark:border-amber-800"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{alert.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">{alert.title}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                        Fecha de vencimiento: {alert.date}
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase">
                    Atención
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleProceedToInspeccion}
                className="flex-1 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-200 dark:shadow-none"
              >
                Entendido, Continuar Inspección
              </button>
              <button
                onClick={() => {
                  setAlerts([]);
                  setPendingVehiculo(null);
                }}
                className="px-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 font-bold py-4 rounded-2xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: VERIFICAR PLACA */}
        {step === 1 ? (
          <form
            onSubmit={handleVerificarPlaca}
            className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl border dark:border-gray-700 shadow-sm space-y-8 animate-fade-in"
          >
            <div className="text-center mb-8">
              <label className="block text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                Ingrese la Placa
              </label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                className="w-full border-b-4 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-none p-4 text-center text-5xl font-black uppercase transition-all bg-transparent outline-none text-gray-800 dark:text-white"
                placeholder="ABC123"
                required
                autoFocus
              />
            </div>

            <button
              disabled={isVerifying || !placa}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 text-xl"
            >
              {isVerifying ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verificando...
                </>
              ) : (
                "Siguiente"
              )}
            </button>

            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Si el vehículo ya está registrado, podrá iniciar la inspección de
              inmediato.
            </p>
          </form>
        ) : (
          /* STEP 2: REGISTRO DE VEHÍCULO NUEVO */
          <div className="space-y-8 animate-fade-in">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium mb-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver a verificar placa
            </button>

            {message && (
              <div
                className={`p-4 rounded-2xl text-center font-medium transition-all ${message.includes("éxito") ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}
              >
                {message}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border dark:border-gray-700 shadow-sm space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Datos Obligatorios
                </h3>
                <button
                  onClick={handleConsultarLegal}
                  className="text-sm bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold transition-all flex items-center gap-2"
                >
                  🔍 Consultar SOAT / RUNT
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Marca del Vehículo
                  </label>
                  <input
                    type="text"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ej: Yamaha, Honda, Suzuki"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Placa (Confirmada)
                  </label>
                  <input
                    type="text"
                    value={placa}
                    readOnly
                    className="w-full border dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl p-4 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Vigencia SOAT
                  </label>
                  <input
                    type="date"
                    value={fechaSoat}
                    onChange={(e) => setFechaSoat(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Vigencia Tecno
                  </label>
                  <input
                    type="date"
                    value={fechaTecno}
                    onChange={(e) => setFechaTecno(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                    Pago Impuesto
                  </label>
                  <input
                    type="date"
                    value={fechaImpuesto}
                    onChange={(e) => setFechaImpuesto(e.target.value)}
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* CARGA DE IMAGEN */}
              <div className="pt-4">
                <label className="block text-sm font-bold text-gray-800 dark:text-white mb-4">
                  Foto del Vehículo
                </label>
                {showCamera && (
                  <CameraCapture
                    onCapture={handleCapture}
                    onClose={() => setShowCamera(false)}
                    label="Foto del Vehículo"
                  />
                )}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-1/3 aspect-video bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center relative overflow-hidden group text-center">
                    {previewUrl ? (
                      <>
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">MARCA DE AGUA APLICADA</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 dark:text-gray-500">
                        <span className="text-4xl block mb-2">📸</span>
                        <span className="text-xs font-medium">Sin foto de evidencia</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {previewUrl ? "Volver a Tomar Foto" : "Tomar Foto del Vehículo (En Vivo)"}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2 text-center md:text-left font-medium uppercase tracking-wider">
                      Captura obligatoria con evidencia de GPS y Tiempo Real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white px-2">
                Seleccione Tipo de Vehículo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiposVehiculos.map((v) => (
                  <button
                    key={v.id}
                    disabled={isUploading || isVerifying}
                    onClick={() => handleRegistroVehiculo(v.id)}
                    className={`bg-white dark:bg-gray-800 border dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 p-6 rounded-3xl hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-none transition-all flex flex-col items-center group relative overflow-hidden ${isUploading || isVerifying ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-bl-3xl transform translate-x-8 -translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-all flex items-center justify-center">
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {v.icon}
                    </span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {isUploading ? "Subiendo..." : v.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
