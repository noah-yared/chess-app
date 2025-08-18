const API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class Client {
  constructor(
    private readonly baseUrl: string = API_URL,
    private readonly headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ) {}
  
  private async request<T>(endpoint: string, method: string, body?: unknown): Promise<T> {
    console.log(`Making a ${method} request to ${this.baseUrl}${endpoint} with the following body:\n${JSON.stringify(body)}`);
    const response: Response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`${response.status}: HTTP request to ${endpoint} failed!`);
    }

    return await response.json();
  }

  public async get<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, 'GET', body);
  }

  public async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, 'POST', body);
  }

};
