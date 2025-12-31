import axios from "axios";

const api = axios.create({
  // O Next.js vai ler essa variável de ambiente. 
  // Se não existir (rodando local), usa localhost.
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export default api;