import { ImportOptions } from "@/components/custom/data-importer";
import { ImportBatch } from "@/components/custom/progress-panel";
import axios from "@/lib/axios";
import { ImportTypes } from "@/pages/admin/importacoes/config";
import { ApiResponse, PaginationData } from "@/types/api-response";
import { Avaria, Cliente, Cluster, Filial, ItemAvaria, Mapa, Motorista, NotaFiscal, Produto, TiposAvaria } from "@/types/consults";
import { cacheGet, networkOrCache } from "@/lib/offline/cache";
import { assertReachable, BULK_TIMEOUT, isUnreachable, REQUEST_TIMEOUT } from "@/lib/offline/network";
import {
  applyAvariasOverlay,
  applyNotaOverlay,
  enqueueCreate,
  enqueueEnviar,
  hasPendingOps,
  isLocalId,
  removeLocalAvaria,
} from "@/lib/offline/outbox";

const OFFLINE_REMOVE_MESSAGE = 'Sem conexão: só é possível remover esta avaria quando houver internet.';

const normalize = (text?: string | null) => (text ?? '').toLowerCase();

/**
 * TiposAvaria service
 */
export const tiposAvariaService = {
  read: async () => {
    try {
      return await networkOrCache<TiposAvaria[]>('tipos-avaria', () =>
        axios.get<ApiResponse<TiposAvaria[]>>('/tipos-avaria', { timeout: REQUEST_TIMEOUT })
      );
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

export type MovimentoVendaTroca = {
  id: string;
  origem: 'nota' | 'troca';
  cliente: string;
  cliente_codigo: string;
  nota: string;
  produto_codigo: string;
  produto: string;
  quantidade: number;
  operacao: '1' | '2' | '5' | '39';
  data_operacao: string;
  created_at: string;
};

export const trocaService = {
  read: async (params: { page: number; per_page: number; search?: string; operacao?: string; data_inicial?: string; data_final?: string }, signal?: AbortSignal) => {
    const response = await axios.get<ApiResponse<MovimentoVendaTroca[]> & { pagination: PaginationData }>('/trocas', { params, signal });
    return response.data;
  },
  exportar: async (dataInicial: string, dataFinal: string) => {
    const response = await axios.get<Blob>('/trocas/exportar', { params: { data_inicial: dataInicial, data_final: dataFinal }, responseType: 'blob' });
    return response.data;
  },
};

/**
 * Avaria service
 */
export const avariaService = {

  create: async (
    data: {
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
    },
    /** Dados usados para exibir a avaria localmente caso ela precise ser salva offline. */
    context?: { notaFiscal: NotaFiscal; tiposAvaria: TiposAvaria[] }
  ): Promise<ApiResponse> => {
    const queue = async (): Promise<ApiResponse> => {
      await enqueueCreate(data.cliente_id, data, {
        notaFiscalId: context?.notaFiscal.id ?? '',
        notaFiscalNumero: context?.notaFiscal.numero ?? '',
        itens: data.produtos.map((p) => {
          const produto = context?.notaFiscal.produtos.find((x) => x.id === p.produto_id);
          const tipo = context?.tiposAvaria.find((t) => t.id === p.tipo_avaria_id);
          return {
            produtoId: p.produto_id,
            codigo: produto?.codigo ?? '',
            descricao: produto?.descricao ?? '',
            quantidade: p.quantidade,
            quantidadeTotal: (produto?.quantidade ?? 0) + (produto?.quantidade_avariada ?? 0),
            unidadeMedida: produto?.unidade_medida ?? null,
            tipoAvaria: {
              id: p.tipo_avaria_id,
              codigo: tipo?.codigo ?? '5',
              nome: tipo?.nome ?? '',
              descricao: tipo?.descricao ?? '',
            },
          };
        }),
      });

      return {
        success: true,
        queued: true,
        data: null,
        message: 'Sem conexão: avaria salva no aparelho e será enviada quando a internet voltar.',
      };
    };

    // Já existem registros esperando sincronização: mantém a ordem e entra na fila.
    if (await hasPendingOps()) return queue();

    try {
      const response = assertReachable(await axios.post<ApiResponse>(`/avarias`, { ...data }, { timeout: 60_000 }));
      return response.data;
    } catch (error) {
      if (isUnreachable(error)) return queue();
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

  retryWhatsApp: async (id: string, phone: string) => {
    try {
      const response = await axios.post<ApiResponse<Avaria>>(`/avarias/${id}/whatsapp/retry`, { phone });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  enviar: async (id: string, context?: { clienteId?: string; notaFiscalNumero?: string }): Promise<ApiResponse> => {
    const queue = async (): Promise<ApiResponse> => {
      await enqueueEnviar(context?.clienteId ?? '', context?.notaFiscalNumero ?? '', isLocalId(id) ? undefined : id);
      return {
        success: true,
        queued: true,
        data: null,
        message: 'Sem conexão: o envio será feito quando a internet voltar.',
      };
    };

    // Avaria que ainda só existe no aparelho (ou com itens na frente na fila): espera a sincronização.
    if (isLocalId(id) || (await hasPendingOps())) return queue();

    try {
      const response = assertReachable(
        await axios.put<ApiResponse>(`/avarias/${id}/status`, { status: 'aguardando_aprovacao' }, { timeout: REQUEST_TIMEOUT })
      );
      return response.data;
    } catch (error) {
      if (isUnreachable(error)) return queue();
      console.error(error);
      throw error;
    }
  },

  remover: async (id: string): Promise<ApiResponse> => {
    // Avaria criada offline que ainda não subiu: basta cancelar o registro na fila.
    if (isLocalId(id)) {
      await removeLocalAvaria(id);
      return { success: true, data: null, message: 'Avaria removida.' };
    }

    try {
      const response = assertReachable(await axios.delete<ApiResponse>(`/avarias/${id}`, { timeout: REQUEST_TIMEOUT }));
      return response.data;
    } catch (error) {
      if (isUnreachable(error)) return { success: false, data: null, message: OFFLINE_REMOVE_MESSAGE };
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
    filial?: string
    limit?: number
  }, signal?: AbortSignal) => Promise<ApiResponse<Cliente[]>>

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
  read: async (params, signal) => {
    try {
      const response = await axios.get<ApiResponse<Cliente[]>>(`/clientes`, {
        signal,
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
      // A API devolve objeto (1 nota), lista (várias) ou null (nenhuma): normalizamos para lista.
      const asList = (d: NotaFiscal | NotaFiscal[] | null) => (Array.isArray(d) ? d : d ? [d] : []);

      const response = await networkOrCache<NotaFiscal[]>(
        `cliente:${id}:notas`,
        async () => {
          const res = await axios.get<ApiResponse<NotaFiscal | NotaFiscal[] | null>>(`/clientes/${id}/notas-fiscais`, {
            params: { search },
            timeout: BULK_TIMEOUT,
          });
          if (res.data?.success) res.data.data = asList(res.data.data) as never;
          return res as never;
        },
        {
          save: !search,
          transform: (cached) => (search ? cached.filter((n) => normalize(n.numero).includes(normalize(search))) : cached),
        }
      );

      if (response.success) {
        response.data = await Promise.all(response.data.map((n) => applyNotaOverlay(id, n)));
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  notaFiscal: async ({ id, search }) => {
    try {
      try {
        const response = assertReachable(
          await axios.get<ApiResponse<NotaFiscal>>(`/clientes/${id}/notas-fiscais/${search}`, { timeout: REQUEST_TIMEOUT })
        );
        const body = response.data;
        if (body.success) body.data = await applyNotaOverlay(id, body.data);
        return body;
      } catch (error) {
        if (!isUnreachable(error)) throw error;
      }

      // Sem conexão: procura a nota na lista salva no aparelho.
      const cached = await cacheGet<NotaFiscal[]>(`cliente:${id}:notas`);
      if (!cached) {
        return { success: false, message: 'Sem conexão e sem notas salvas neste aparelho.', data: null as never, offline: true };
      }

      const found = cached.value.find((n) => n.numero === search) ?? null;
      return {
        success: true,
        message: '',
        data: (await applyNotaOverlay(id, found)) as NotaFiscal,
        offline: true,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  avarias: async ({ id, ...params }, signal) => {
    try {
      const status = params.status;

      const response = await networkOrCache<Avaria[]>(
        `cliente:${id}:avarias`,
        () => axios.get<ApiResponse<Avaria[]>>(`/clientes/${id}/avarias`, { params, signal, timeout: BULK_TIMEOUT }),
        { save: !status }
      );

      // Mescla o que está na fila (avarias novas e envios pendentes) e aplica o filtro de status.
      if (response.success) {
        response.data = await applyAvariasOverlay(id, response.data, status);
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

interface MapaService {
  clientes: (params: {
    id: string
    [key: string]: string | undefined
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

  atualizarClientes: (params: {
    mapaId: string
    clientes: string[]
  }, signal?: AbortSignal) => Promise<ApiResponse<Mapa>>
}
export const mapaService: MapaService = {
  clientes: async ({ id, ...params }, signal) => {
    try {
      const search = params.search?.trim();

      return await networkOrCache<Cliente[]>(
        `mapa:${id}:clientes`,
        () => axios.get<ApiResponse<Cliente[]>>(`/mapas/${id}/clientes`, { signal, params, timeout: REQUEST_TIMEOUT }),
        {
          save: !search,
          transform: (cached) => {
            if (!search) return cached;
            const term = normalize(search);
            return cached.filter(
              (c) =>
                normalize(c.codigo).includes(term) ||
                normalize(c.nome_fantasia).includes(term) ||
                normalize(c.razao_social).includes(term)
            );
          },
        }
      );
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
      const response = await axios.put<ApiResponse>(`/mapas/${mapaId}/designar-motorista/${motoristaId}`, {}, { signal });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  atualizarClientes: async ({ mapaId, clientes }, signal) => {
    try {
      const response = await axios.put<ApiResponse<Mapa>>(`/mapas/${mapaId}/clientes`, { clientes }, { signal });
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
    filial: string
    status?: string
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

/**
 * Auth service
 */
export const authService = {
  changePassword: async (data: {
    senha_antiga: string
    senha_nova: string
    confirmar_senha_nova: string
  }) => {
    try {
      const response = await axios.post<ApiResponse>(`/auth/change-password`, data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

/**
 * Filial service
 */
export const filialService = {
  read: async (params: {
    [key: string]: string | undefined
  }, signal?: AbortSignal) => {
    try {
      const response = await axios.get<ApiResponse<Filial[]>>(`/filiais`, {
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
 * Cluster service
 */
export const clusterService = {
  read: async (params: {
    [key: string]: string | undefined
  }, signal?: AbortSignal) => {
    try {
      const response = await axios.get<ApiResponse<Cluster[]>>(`/clusters`, {
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
 * Importer Model service
 */
export const importerModelService = {
  downloadModel: async (type: string) => {
    try {
      const response = await axios.get<Blob>(`/exportar/modelo/${type}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

/**
 * Importer service
 */
export const importerService = {
  read: async (params?: {
    type: ImportTypes
  }, signal?: AbortSignal) => {
    try {
      const response = await axios.get<ApiResponse<ImportBatch[]>>(`/importar`, {
        params,
        signal
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  importData: async (data: {
    type: ImportTypes
    records: Record<string, string>[]
    options: ImportOptions | null
  }) => {
    try {
      const response = await axios.post<ApiResponse<ImportBatch>>(
        `/importar`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
