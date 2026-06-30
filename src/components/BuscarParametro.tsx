import { useState, useMemo } from "react";
import type { Parametro } from "../types/parametro";

export default function BuscarParametro({ registros }: { registros: Parametro[] }) {
  const [q, setQ] = useState("");
  const [campo, setCampo] = useState("todos");

  const resultados = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return [];
    return registros.filter((r) => {
      if (campo === "consecutivo") return String(r.consecutivo).includes(t);
      if (campo === "parametro") return r.parametro.toLowerCase().includes(t);
      if (campo === "tipogrupo") return r.tipogrupo.toLowerCase().includes(t);
      if (campo === "nota") return r.nota.toLowerCase().includes(t);
      return (
        String(r.consecutivo).includes(t) ||
        r.parametro.toLowerCase().includes(t) ||
        r.valor.toLowerCase().includes(t) ||
        r.descripcion.toLowerCase().includes(t) ||
        r.tipogrupo.toLowerCase().includes(t) ||
        r.nota.toLowerCase().includes(t)
      );
    });
  }, [q, campo, registros]);

  return (
    <section id="sec-buscar" className="seccion activa">
      <div className="card">
        <h2 className="card-titulo">Buscar Parámetro</h2>
        <p className="card-sub">Filtra los registros en tiempo real.</p>
        <div className="busqueda-row">
          <input type="text" placeholder="Escribe para buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={campo} onChange={(e) => setCampo(e.target.value)}>
            <option value="todos">Todos los campos</option>
            <option value="consecutivo">Consecutivo</option>
            <option value="parametro">Parámetro</option>
            <option value="tipogrupo">Tipo Grupo</option>
            <option value="nota">Nota</option>
          </select>
        </div>
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr><th>Consecutivo</th><th>Parámetro</th><th>Valor</th><th>Descripción</th><th>Tipo Grupo</th><th>Nota</th></tr>
            </thead>
            <tbody>
              {!q ? (
                <tr><td colSpan={6} className="msg-tabla">Escribe algo para buscar…</td></tr>
              ) : resultados.length === 0 ? (
                <tr><td colSpan={6} className="msg-tabla">📭 Sin registros.</td></tr>
              ) : (
                resultados.map((r, i) => (
                  <tr key={`${r.consecutivo}-${i}`}>
                    <td><strong>{r.consecutivo}</strong></td>
                    <td>{r.parametro}</td>
                    <td>{r.valor}</td>
                    <td>{r.descripcion}</td>
                    <td><span className={`badge badge-${r.tipogrupo}`}>{r.tipogrupo}</span></td>
                    <td>{r.nota}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}