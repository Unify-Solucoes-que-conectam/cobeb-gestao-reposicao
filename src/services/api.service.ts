import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Avaria, Cliente, ItemAvaria, Mapa, Motorista, NotaFiscal, Produto, TiposAvaria } from "@/types/consults";

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
interface NotaFiscalReadParams {
  search?: string;
  individual?: boolean;
  clienteId?: string;
}
export const notaFiscalService = {
  read: async (params: NotaFiscalReadParams, signal?: AbortSignal) => {
    try {
      const response = await axios.get<ApiResponse<NotaFiscal[]>>(`/notas-fiscais${params.individual && params.search ? `/${params.search}` : ''}`, {
        params: {
          ...(!params.individual ? { search: params.search } : {}),
          clienteId: params.clienteId,
          detalhar: true
        },
        signal
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
    motorista_id: string
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
        status: 'aprovada'
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  reprovar: async (id: string, motivo: string) => {
    try {
      const response = await axios.put<ApiResponse>(`/avarias/${id}/status`, {
        status: 'reprovada',
        motivo_reprovacao: motivo
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  enviar: async (id: string) => {
    try {
      const response = await axios.put<ApiResponse>(`/avarias/${id}/status`, {
        status: 'enviada'
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  remover: async (id: string) => {
    try {
      const response = await axios.delete<ApiResponse>(`/avarias/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  atualizarQuantidadeAvariada: async (avariaId: string, produtoId: string, quantidade: number) => {
    try {
      const response = await axios.put<ApiResponse>(`/avarias/${avariaId}/produtos/${produtoId}`, {
        quantidade
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  read: async (params: {
    [key: string]: string | undefined
  }, signal?: AbortSignal) => {
    try {
      const response = await axios.get<ApiResponse<Avaria[]>>(`/avarias`, {
        params,
        signal
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

/**
 * ItemAvariaService
 */
export interface ItemAvariaService {
  read: (params: {
    id: string
  }, signal?: AbortSignal) => Promise<ApiResponse<ItemAvaria[]>>
}
export const itemAvariaService: ItemAvariaService = {
  read: async ({ id }, signal) => {
    try {
      const response = await axios.get<ApiResponse<ItemAvaria[]>>(`/avarias/${id}/itens`, { signal });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export interface ClienteService {
  read: (params: {
    search?: string
  }) => Promise<ApiResponse<Cliente[]>>

  notasFiscais: (params: {
    id: string
    search?: string
  }) => Promise<ApiResponse<NotaFiscal[]>>

  notaFiscal: (params: {
    id: string
    search?: string
  }) => Promise<ApiResponse<NotaFiscal>>

  avarias: (params: {
    id: string
    [key: string]: string | undefined
  }, signal?: AbortSignal) => Promise<ApiResponse<Avaria[]>>
}
export const clienteService: ClienteService = {
  read: async (params) => {
    try {
      const response = await axios.get<ApiResponse<Cliente[]>>(`/clientes`, {
        params: {
          ...params,
          search: params.search,
        }
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  notasFiscais: async ({ id, search }) => {
    try {
      const response = await axios.get<ApiResponse<NotaFiscal[]>>(`/clientes/${id}/notas-fiscais`, {
        params: {
          search,
        }
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  notaFiscal: async ({ id, search }) => {
    try {
      const response = await axios.get<ApiResponse<NotaFiscal>>(`/clientes/${id}/notas-fiscais/${search}`);

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  avarias: async ({ id, ...params }, signal) => {
    try {
      const response = await axios.get<ApiResponse<Avaria[]>>(`/clientes/${id}/avarias`, {
        params,
        signal
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

interface MapaService {
  clientes: (params: {
    id: string
  }, signal?: AbortSignal) => Promise<ApiResponse<Cliente[]>>

  avarias: (params: {
    id: string
    [key: string]: string | undefined
  }, signal?: AbortSignal) => Promise<ApiResponse<Avaria[]>>

  read: (params: {
    [key: string]: string | undefined
  }, signal?: AbortSignal) => Promise<ApiResponse<Mapa[]>>

  designarMotorista: (params: {
    mapaId: string
    motoristaId: string
  }, signal?: AbortSignal) => Promise<ApiResponse>
}
export const mapaService: MapaService = {
  clientes: async ({ id }, signal) => {
    try {
      const response = await axios.get<ApiResponse<Cliente[]>>(`/mapas/${id}/clientes`, { signal });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  avarias: async (params, signal) => {
    try {
      const response = await axios.get<ApiResponse<Avaria[]>>(`/mapas/${params.id}/avarias`, {
        signal,
        params
      });

      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  read: async (params, signal) => {
    try {
      const response = await axios.get<ApiResponse<Mapa[]>>(`/mapas`, {
        signal,
        params
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  designarMotorista: async ({ mapaId, motoristaId }, signal) => {
    try {
      const response = await axios.put<ApiResponse>(`/mapas/${mapaId}/designar-motorista/${motoristaId}`, { signal });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
}

/**
 * Motorista service
 */
export const motoristaService = {
  read: async (params: {
    filial_id: string
    status?: string
    only_without_map?: boolean
  }, signal?: AbortSignal) => {
    try {
      const response = await axios.get<ApiResponse<Motorista[]>>(`/motoristas`, {
        params,
        signal
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}