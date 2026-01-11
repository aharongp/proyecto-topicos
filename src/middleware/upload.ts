import multer from "multer";
import type { Request } from "express";
import { obtenerTamanoMaximoArchivo, validarTipoMime } from "../utils/validators";

const almacenamiento = multer.memoryStorage();

const carga = multer({
  storage: almacenamiento,
  limits: { fileSize: obtenerTamanoMaximoArchivo() },
  fileFilter: (_req: Request, archivo, callback) => {
    try {
      validarTipoMime(archivo.mimetype);
      callback(null, true);
    } catch (error) {
      callback(error as Error);
    }
  },
});

export const cargarImagenUnica = carga.single("image");
