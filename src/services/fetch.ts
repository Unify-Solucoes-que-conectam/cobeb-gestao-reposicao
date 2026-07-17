import axios from "@/lib/axios"
import { ApiResponse } from "@/types/api-response";
import { TiposAvaria } from "@/types/consults";

export const fetch = {

  /**
   * Consultar tipos de avaria
   */
  tiposAvaria: async () => {
    try {
      const response = await axios.get<ApiResponse<TiposAvaria[]>>('/tipos-avaria');
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}