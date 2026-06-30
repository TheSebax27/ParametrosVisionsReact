import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { db } from "../lib/supabase";
import type { Parametro, TipoMensaje } from "../types/parametro";

export function useParametros() {
  const [registros, setRegistros] = useState<Parametro[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: TipoMensaje }>({ texto: "", tipo: "" });

  const msg = useCallback((texto: string, tipo: TipoMensaje) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4500);
  }, []);

  const cargarTabla = useCallback(async () => {
    setCargando(true);
    try {
      const { data, error } = await db.from("parametros").select("*").order("consecutivo");
      if (error) throw error;
      setRegistros(data || []);
    } catch (e: any) {
      msg("❌ Error al cargar datos: " + e.message, "error");
    } finally {
      setCargando(false);
    }
  }, [msg]);

  const guardarParametro = useCallback(
    async (form: Parametro) => {
      const { consecutivo: cons, parametro: param, valor, descripcion: desc, tipogrupo: tipo, nota } = form;

      if (!cons || !param || !desc || !tipo) {
        msg("⚠️ Los campos con * en rojo son obligatorios.", "error");
        return false;
      }
      if (Number(cons) <= 0) {
        msg("⚠️ El consecutivo debe ser mayor que 0.", "error");
        return false;
      }

      try {
        const { data: dupParam } = await db.from("parametros").select("parametro").eq("parametro", String(param));
        if (dupParam && dupParam.length > 0) {
          msg(`❌ El parámetro "${param}" ya existe.`, "error");
          return false;
        }

        const { data: dupCons } = await db.from("parametros").select("consecutivo").eq("consecutivo", Number(cons));
        if (dupCons && dupCons.length > 0) {
          const resultado = await Swal.fire({
            icon: "warning",
            title: "Consecutivo duplicado",
            html: `<div style="text-align:left;line-height:1.8">
              <p><strong>⚠️ El consecutivo ${cons} ya existe en la base de datos.</strong></p>
              <p>¿Qué deseas hacer?</p></div>`,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "✏️ Modificar el consecutivo",
            denyButtonText: "✅ Aceptar y guardar",
            cancelButtonText: "❌ Cancelar",
            confirmButtonColor: "#3085d6",
            denyButtonColor: "#28a745",
            cancelButtonColor: "#d33",
          });

          if (resultado.isConfirmed) {
            msg("ℹ️ Por favor, modifica el consecutivo e intenta nuevamente.", "info");
            return false;
          } else if (!resultado.isDenied) {
            return false; // cancelar
          }
          // isDenied -> continúa
        }

        const { error } = await db.from("parametros").insert([
          { consecutivo: Number(cons), parametro: param, valor, descripcion: desc, tipogrupo: tipo, nota },
        ]);
        if (error) throw error;

        msg(`✅ Parámetro #${cons} guardado correctamente.`, "exito");
        await cargarTabla();
        return true;
      } catch (e: any) {
        msg("❌ Error al guardar: " + (e.message || "revisa la consola."), "error");
        return false;
      }
    },
    [msg, cargarTabla]
  );

  const eliminar = useCallback(
    async (cons: number) => {
      if (!confirm(`¿Eliminar el parámetro #${cons}?`)) return;
      try {
        const { error } = await db.from("parametros").delete().eq("consecutivo", cons);
        if (error) throw error;
        msg(`✅ Parámetro #${cons} eliminado.`, "exito");
        await cargarTabla();
      } catch (e: any) {
        msg("❌ " + e.message, "error");
      }
    },
    [msg, cargarTabla]
  );

  const actualizarParametro = useCallback(
    async (form: Parametro) => {
      const { consecutivo: cons, parametro: param, valor, descripcion: desc, tipogrupo: tipo, nota } = form;
      if (!param || !desc || !tipo) {
        msg("⚠️ Los campos parámetro, descripción y tipo son obligatorios.", "error");
        return false;
      }
      try {
        const { error } = await db
          .from("parametros")
          .update({ parametro: param, valor, descripcion: desc, tipogrupo: tipo, nota })
          .eq("consecutivo", Number(cons));
        if (error) throw error;
        msg(`✅ Parámetro #${cons} actualizado.`, "exito");
        await cargarTabla();
        return true;
      } catch (e: any) {
        msg("❌ " + e.message, "error");
        return false;
      }
    },
    [msg, cargarTabla]
  );

  const exportExcel = useCallback(() => {
    if (!registros.length) { msg("⚠️ No hay datos.", "error"); return; }
    const datos = registros.map((r) => ({
      Consecutivo: r.consecutivo, Parámetro: r.parametro, Valor: r.valor,
      Descripción: r.descripcion, TipoGrupo: r.tipogrupo, Nota: r.nota,
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parámetros");
    XLSX.writeFile(wb, "AyudaVisions_Parametros.xlsx");
    msg("✅ Excel generado.", "exito");
  }, [registros, msg]);

  const exportExcelP = useCallback(() => {
    const ws = XLSX.utils.aoa_to_sheet([["Consecutivo", "Parámetro", "Valor", "Descripción", "TipoGrupo", "Nota"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "Plantilla_AyudaVisions_Parametros.xlsx");
    Swal.fire({ icon: "success", title: "Plantilla descargada", text: "Ya puedes diligenciarla y volver a subirla." });
  }, []);

  const exportPDF = useCallback(() => {
    if (!registros.length) { msg("⚠️ No hay datos.", "error"); return; }
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFillColor(0, 0, 0); doc.rect(0, 0, 297, 20, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text("AYUDA VISIONS – Reporte de Parámetros", 14, 13);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 200, 13);
    // @ts-ignore - autotable extiende jsPDF en runtime
    doc.autoTable({
      startY: 24,
      head: [["Consecutivo", "Parámetro", "Valor", "Descripción", "Tipo Grupo", "Nota"]],
      body: registros.map((r) => [r.consecutivo, r.parametro, r.valor, r.descripcion, r.tipogrupo, r.nota]),
      headStyles: { fillColor: [0, 87, 184], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 8.5, textColor: [20, 20, 20] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 4 },
    });
    // @ts-ignore
    const n = doc.internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(130, 130, 130);
      doc.text(`Pág ${i}/${n} | Ayuda Visions`, 14, doc.internal.pageSize.height - 6);
    }
    doc.save("AyudaVisions_Parametros.pdf");
    msg("✅ PDF generado.", "exito");
  }, [registros, msg]);

  const importExcel = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const hoja = workbook.Sheets[workbook.SheetNames[0]];
          const datos: any[] = XLSX.utils.sheet_to_json(hoja);

          if (datos.length === 0) {
            Swal.fire({ icon: "warning", title: "Archivo vacío", text: "El Excel no contiene datos." });
            return;
          }

          Swal.fire({
            title: "Importando parámetros...",
            html: `<div style="margin-top:15px">
              <div style="width:100%;height:24px;background:#ececec;border-radius:20px;overflow:hidden;">
                <div id="barraProgreso" style="width:0%;height:100%;background:linear-gradient(90deg,#2563eb,#06b6d4);transition:width .25s ease;"></div>
              </div>
              <div id="textoProgreso" style="margin-top:18px;font-size:15px;line-height:1.6;">Preparando importación...</div>
            </div>`,
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });

          let registrosInsertados = 0;
          const errores: string[] = [];
          const inicio = Date.now();

          const buscarColumna = (fila: any, posibles: string[]) => {
            for (const nombre of posibles) if (fila[nombre] !== undefined) return fila[nombre];
            return null;
          };

          for (let i = 0; i < datos.length; i++) {
            const fila = datos[i];
            const consecutivo = buscarColumna(fila, ["Consecutivo"]);
            const parametro = buscarColumna(fila, ["Parámetro", "Parametro"]);
            const valor = buscarColumna(fila, ["Valor"]);
            const descripcion = buscarColumna(fila, ["Descripción", "Descripcion"]);
            const tipoGrupo = buscarColumna(fila, ["Tipo Grupo", "TipoGrupo", "tipo grupo"]);
            const nota = buscarColumna(fila, ["Nota", "nota"]) || "";

            if (!consecutivo || !parametro || !descripcion || !tipoGrupo) {
              errores.push(`Fila ${i + 1}: Faltan campos requeridos.`);
            } else {
              try {
                const { data: dupParam } = await db.from("parametros").select("parametro").eq("parametro", String(parametro));
                if (dupParam && dupParam.length > 0) {
                  errores.push(`Fila ${i + 1}: El parámetro "${parametro}" ya existe.`);
                } else {
                  const { error } = await db.from("parametros").insert([{
                    consecutivo: Number(consecutivo), parametro: String(parametro),
                    valor: String(valor), descripcion: String(descripcion),
                    tipogrupo: String(tipoGrupo).toUpperCase(), nota: String(nota),
                  }]);
                  if (error) errores.push(`Fila ${i + 1}: ${error.message}`);
                  else registrosInsertados++;
                }
              } catch {
                errores.push(`Fila ${i + 1}: Error inesperado.`);
              }
            }

            const porcentaje = Math.round(((i + 1) / datos.length) * 100);
            const segundos = Math.floor((Date.now() - inicio) / 1000);
            const barra = document.getElementById("barraProgreso");
            const texto = document.getElementById("textoProgreso");
            if (barra) barra.style.width = porcentaje + "%";
            if (texto) {
              texto.innerHTML = `<strong style="font-size:18px">${porcentaje}%</strong><br><br>
                Procesando registro <strong>${i + 1}</strong> de <strong>${datos.length}</strong><br><br>
                ✅ Insertados: <strong>${registrosInsertados}</strong><br>
                ❌ Errores: <strong>${errores.length}</strong><br>
                ⏱ Tiempo: <strong>${segundos}s</strong>`;
            }
            await new Promise((resolve) => setTimeout(resolve, 5));
          }

          Swal.close();
          if (registrosInsertados > 0) {
            msg(`✅ Se importaron ${registrosInsertados} de ${datos.length} registros.`, "exito");
            await cargarTabla();
          }

          if (errores.length > 0) {
            Swal.fire({
              icon: registrosInsertados > 0 ? "warning" : "error",
              title: "Importación finalizada",
              html: `<div style="text-align:left;line-height:1.8">
                <p><strong>📄 Total registros:</strong> ${datos.length}</p>
                <p style="color:#16a34a"><strong>✅ Insertados:</strong> ${registrosInsertados}</p>
                <p style="color:#dc2626"><strong>❌ Errores:</strong> ${errores.length}</p>
                <hr><strong>Detalle de errores:</strong>
                <ul style="max-height:220px;overflow:auto;text-align:left;margin-top:10px;">
                  ${errores.slice(0, 10).map((e) => `<li>${e}</li>`).join("")}
                  ${errores.length > 10 ? `<li><strong>... y ${errores.length - 10} errores más.</strong></li>` : ""}
                </ul></div>`,
              width: 650,
              scrollbarPadding: false,
            });
          } else if (registrosInsertados > 0) {
            Swal.fire({
              icon: "success",
              title: "🎉 Importación completada",
              html: `<div style="font-size:16px;line-height:1.8"><p>Se importaron correctamente</p>
                <h2 style="color:#16a34a;margin:10px 0;">${registrosInsertados}</h2><p>registros.</p></div>`,
            });
          }
        } catch (error) {
          console.error("Error al procesar Excel:", error);
          Swal.close();
          Swal.fire({ icon: "error", title: "Error", text: "El archivo Excel tiene un formato inválido." });
        }
      };

      reader.onerror = () => {
        Swal.close();
        Swal.fire({ icon: "error", title: "Error de lectura", text: "No fue posible leer el archivo." });
      };

      reader.readAsArrayBuffer(file);
    },
    [msg, cargarTabla]
  );

  return {
    registros, cargando, mensaje, msg,
    cargarTabla, guardarParametro, eliminar, actualizarParametro,
    exportExcel, exportExcelP, exportPDF, importExcel,
  };
}