import { useState, useEffect } from "react";
import type { Parametro } from "../types/parametro";

type Props = {
  registro: Parametro | null;
  onCerrar: () => void;
  onActualizar: (f: Parametro) => Promise<boolean>;
};

export default function ModalEditar({ registro, onCerrar, onActualizar }: Props) {
  const [form, setForm] = useState<Parametro | null>(registro);

  useEffect(() => setForm(registro), [registro]);

  if (!registro || !form) return null;

  const guardar = async () => {
    const ok = await onActualizar(form);
    if (ok) onCerrar();
  };

  return (
    <div className="modal-fondo abierto" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">✏️ Editar Parámetro</h3>
        <div className="form-grid">
          <div className="campo">
            <label>Consecutivo (no editable)</label>
            <input type="number" value={form.consecutivo} disabled />
          </div>
          <div className="campo">
            <label>Parámetro</label>
            <input type="text" value={form.parametro} onChange={(e) => setForm({ ...form, parametro: e.target.value })} />
          </div>
          <div className="campo">
            <label>Valor</label>
            <input type="text" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
          </div>
          <div className="campo campo-full">
            <label>Descripción</label>
            <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="campo">
            <label>Tipo Grupo</label>
            <input type="text" value={form.tipogrupo} onChange={(e) => setForm({ ...form, tipogrupo: e.target.value })} />
          </div>
          <div className="campo campo-full">
            <label>Nota (Opcional)</label>
            <textarea rows={3} value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} />
          </div>
        </div>
        <div className="acciones">
          <button className="btn btn-guardar" onClick={guardar}>💾 Actualizar</button>
          <button className="btn btn-limpiar" onClick={onCerrar}>✖ Cancelar</button>
        </div>
      </div>
    </div>
  );
}