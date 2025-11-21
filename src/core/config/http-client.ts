
// Abstracción del cliente HTTP para evitar acoplamiento con fetch/axios
export interface IHttpClient {
  get<T>(url: string): Promise<T>;
}

// Implementación concreta usando Fetch API nativa
// Implementación concreta usando Fetch API nativa
export class FetchHttpAdapter implements IHttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    // ESTA es la corrección: Añadir `as T` para la aserción de tipo.
    return (await response.json()) as T;
  }
}