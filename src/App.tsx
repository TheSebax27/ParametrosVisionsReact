import { useState, useEffect } from "react";
import Header from "./components/Header";
import Mensaje from "./components/Mensaje";
import FormularioParametro from "./components/FormularioParametro";
import TablaParametros from "./components/TablaParametros";
import BuscarParametro from "./components/BuscarParametro";
import ModalEditar from "./components/ModalEditar";
//import SeccionIp from "./components/SeccionIp";
import Footer from "./components/Footer";
import { useParametros } from "./hooks/useParametros";
import type { Parametro } from "./types/parametro";
import "./styles/style.css";

export default function App() {
  const [seccion, setSeccion] = useState("formulario");
  const [editando, setEditando] = useState<Parametro | null>(null);
  const {
    registros, mensaje, cargarTabla, guardarParametro,
    eliminar, actualizarParametro, exportExcel, exportExcelP, exportPDF, importExcel,
  } = useParametros();

  useEffect(() => { cargarTabla(); }, [cargarTabla]);

  const abrirModal = (cons: number) => {
    const r = registros.find((x) => x.consecutivo === cons) || null;
    setEditando(r);
  };

  return (
    <>
      <Header seccion={seccion} setSeccion={setSeccion} />
      <Mensaje texto={mensaje.texto} tipo={mensaje.tipo} />

      {seccion === "formulario" && (
        <FormularioParametro onGuardar={guardarParametro} onImportExcel={importExcel} onExportPlantilla={exportExcelP} />
      )}
      {seccion === "tabla" && (
        <TablaParametros registros={registros} onEditar={abrirModal} onEliminar={eliminar} onExportExcel={exportExcel} onExportPDF={exportPDF} />
      )}
      {seccion === "buscar" && <BuscarParametro registros={registros} />}
      {/*seccion === "ip" && <SeccionIp />*/}

      <ModalEditar registro={editando} onCerrar={() => setEditando(null)} onActualizar={actualizarParametro} />

      <Footer />
    </>
  );
}