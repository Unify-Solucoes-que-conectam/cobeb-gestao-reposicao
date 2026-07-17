import axios from "@/lib/axios"
import { ApiResponse } from "@/types/api-response";
import { NotaFiscal, TiposAvaria } from "@/types/consults";

/**
 * TiposAvaria service
 */
export const tiposAvariaService = {
  read: async () => {
    try {
      const response = await axios.get<ApiResponse<TiposAvaria[]>>('/tipos-avaria');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

/**
 * NotaFiscal service
 */
export const notaFiscalService = {
  read: async (search?: string, individual = false) => {
    try {
      const response = await axios.get<ApiResponse<NotaFiscal[]>>(`/notas-fiscais${individual && search ? `/${search}` : ''}`, {
        params: {
          ...(!individual ? { search } : {}),
          detalhar: true
        }
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}