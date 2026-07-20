import axios from "@/lib/axios"
import { ApiResponse } from "@/types/api-response";
import { NotaFiscal, Produto, TiposAvaria } from "@/types/consults";

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

/**
 * Produto service
 */
export const produtoService = {
  read: async (search?: string, individual = false) => {
    try {
      const response = await axios.get<ApiResponse<Produto[]>>(`/produtos${individual && search ? `/${search}` : ''}`, {
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

/**
 * Avaria service
 */
export const avariaService = {

  create: async (data: {
    cliente_id: string
    mapa_id: string | null
    notas_fiscais: string[]
    produtos: Array<{
      produto_id: string
      tipo_avaria_id: string
      quantidade: number
    }>
    anexos: Array<{
      nome: string
      base64: string
    }>
  }) => {
    try {
      const response = await axios.post<ApiResponse>(`/avarias`, {
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  aprovar: async (id: string) => {
    try {
      const response = await axios.put<ApiResponse>(`/avarias/${id}/status`, {
        status: 'aprovado'
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  reprovar: async (id: string) => {
    try {
      const response = await axios.put<ApiResponse>(`/avarias/${id}/status`, {
        status: 'reprovado'
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}