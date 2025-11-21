import { IHttpClient } from "../../core/config/http-client";

// Definición del contrato de datos (DTO)
export interface DolarOfficialResponse {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}


// Servicio de dominio
export class DolarApiService {
  private readonly baseUrl: string;
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient, baseUrl: string = 'https://ve.dolarapi.com/v1') {
    this.httpClient = httpClient;
    this.baseUrl = baseUrl;
  }

  async getOfficialRate(): Promise<DolarOfficialResponse> {
    try {
      const endpoint = `${this.baseUrl}/dolares/oficial`;
      const data = await this.httpClient.get<DolarOfficialResponse>(endpoint);
      
      return this.validateResponse(data);
    } catch (error) {
      console.error('Error fetching official rate:', error);
      throw error;
    }
  }

  // Validación básica de runtime para asegurar integridad de datos
  private validateResponse(data: any): DolarOfficialResponse {
    if (!data || typeof data.promedio !== 'number') {
      throw new Error('Invalid API response schema');
    }
    return data;
  }
}