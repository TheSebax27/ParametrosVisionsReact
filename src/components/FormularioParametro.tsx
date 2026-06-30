import { useRef, useState } from "react";
import type { Parametro } from "../types/parametro";

const VACIO: Parametro = { consecutivo: 0, parametro: "", valor: "", descripcion: "", tipogrupo: "", nota: "" };

type Props = {
  onGuardar: (f: Parametro) => Promise<boolean>;
  onImportExcel: (file: File) => void;
  onExportPlantilla: () => void;
};

export default function FormularioParametro({ onGuardar, onImportExcel, onExportPlantilla }: Props) {
  const [form, setForm] = useState<Parametro>(VACIO);
  const [guardando, setGuardando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const limpiar = () => setForm(VACIO);

  const guardar = async () => {
    setGuardando(true);
    const ok = await onGuardar(form);
    if (ok) limpiar();
    setGuardando(false);
  };

  return (
    <section id="sec-formulario" className="seccion activa">
      <div className="card">
        <h2 className="card-titulo">Nuevo Parámetro</h2>
        <p className="card-sub">Completa los campos para registrar un nuevo parámetro en el sistema.</p>
        <div className="form-grid">
          <div className="campo">
            <label>Consecutivo <span className="req">*</span></label>
            <input type="number" min={1} value={form.consecutivo || ""} placeholder="Ej: 100"
              onChange={(e) => setForm({ ...form, consecutivo: Number(e.target.value) })} />
            <span className="hint">Número único. No se puede repetir.</span>
          </div>
          <div className="campo">
            <label>Parámetro <span className="req">*</span></label>
            <input type="text" value={form.parametro} placeholder="Ej: MAX_USUARIOS"
              onChange={(e) => setForm({ ...form, parametro: e.target.value })} />
          </div>
          <div className="campo">
            <label>Valor (Opcional)</label>
            <input type="text" value={form.valor} placeholder="Ej: 500"
              onChange={(e) => setForm({ ...form, valor: e.target.value })} />
          </div>
          <div className="campo campo-full">
            <label>Descripción <span className="req">*</span></label>
            <textarea rows={3} value={form.descripcion} placeholder="¿Para qué sirve este parámetro?"
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="campo">
            <label>Tipo Grupo <span className="req">*</span></label>
            <input type="text" value={form.tipogrupo} placeholder="Ej: impresion, system"
              onChange={(e) => setForm({ ...form, tipogrupo: e.target.value })} />
          </div>
          <div className="campo campo-full">
            <label>Nota (Opcional)</label>
            <textarea rows={3} value={form.nota} placeholder="Notas adicionales"
              onChange={(e) => setForm({ ...form, nota: e.target.value })} />
          </div>
        </div>
        <div className="acciones">
          <button className="btn btn-guardar" disabled={guardando} onClick={guardar}>
            {guardando ? "⏳ Guardando…" : "💾 Guardar"}
          </button>
          <button className="btn btn-limpiar" onClick={limpiar}>🗑 Limpiar</button>
          <button className="btn btn-excel" onClick={() => fileRef.current?.click()}>📊 Subir Excel</button>
          <button className="btn btn-excel" onClick={onExportPlantilla}>📊 Excel Plantilla</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportExcel(f); e.target.value = ""; }} />
        </div>
      </div>
    </section>
  );
}