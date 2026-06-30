export interface Parametro {
  consecutivo: number;
  parametro: string;
  valor: string;
  descripcion: string;
  tipogrupo: string;
  nota: string;
}

export type TipoMensaje = "exito" | "error" | "info" | "";