import type { Parametro } from "../types/parametro";

type Props = {
  registros: Parametro[];
  onEditar: (cons: number) => void;
  onEliminar: (cons: number) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
};

export default function TablaParametros({ registros, onEditar, onEliminar, onExportExcel, onExportPDF }: Props) {
  return (
    <section id="sec-tabla" className="seccion activa">
      <div className="card">
        <div className="tabla-header">
          <div>
            <h2 className="card-titulo">Registros Guardados</h2>
            <p className="card-sub">{registros.length} registro(s) encontrado(s).</p>
          </div>
          <div className="export-btns">
            <button className="btn btn-excel" onClick={onExportExcel}>📊 Excel</button>
            <button className="btn btn-pdf" onClick={onExportPDF}>📄 PDF</button>
          </div>
        </div>
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>Consecutivo</th><th>Parámetro</th><th>Valor</th>
                <th>Descripción</th><th>Tipo Grupo</th><th>Nota</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr><td colSpan={7} className="msg-tabla">📭 Sin registros.</td></tr>
              ) : (
                registros.map((r, i) => (
                  <tr key={`${r.consecutivo}-${i}`}>
                    <td><strong>{r.consecutivo}</strong></td>
                    <td>{r.parametro}</td>
                    <td>{r.valor}</td>
                    <td>{r.descripcion}</td>
                    <td><span className={`badge badge-${r.tipogrupo}`}>{r.tipogrupo}</span></td>
                    <td>{r.nota}</td>
                    <td style={{ whiteSpace: "nowrap", display: "flex", gap: 6 }}>
                      <button className="btn-editar" onClick={() => onEditar(r.consecutivo)}>✏️ Editar</button>
                      <button className="btn-eliminar" onClick={() => onEliminar(r.consecutivo)}>🗑</button>
                    </td>
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