import type { TipoMensaje } from "../types/parametro";

export default function Mensaje({ texto, tipo }: { texto: string; tipo: TipoMensaje }) {
  if (!tipo) return null;
  return <div id="mensaje" className={tipo}>{texto}</div>;
}