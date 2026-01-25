"use client"; // Necessário porque vamos usar "state" (digitar no input)

import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- Para redirecionar o usuário
import { AxiosError } from "axios"; // <--- Para falar com o Backend
import api from "@/app/src/services/api"
import Link from "next/link";
import { Modal } from "../src/components/modal";
import { ArrowLeft, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react"; // Ícones bonitos
import { Span } from "next/dist/trace";

export default function LoginPage() {
  const router = useRouter()
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Para mostrar msg de erro
  const [loading, setLoading] = useState(false); // Para travar o botão enquanto carrega
  const [showPassword, setShowPassword] = useState(false);

  //Estados do modal de "esqueci minha senha"
  const [forgotMyPasswordEmail, setForgotMyPasswordEmail] = useState("")
  const [isForgotMyPasswordOpen, setIsForgotMyPasswordOpen] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false)

  const [msgError, setMsgError] = useState("");
  const [msgSuccess, setMsgSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Limpa erros anteriores
    setLoading(true); // Ativa o spinner

    try {
      // O FastAPI espera 'username' e 'password' no formato x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', email); // O campo TEM que chamar username, mesmo sendo email
      formData.append('password', password);

      const response = await api.post('/api/v1/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Se chegou aqui, deu certo!
      const { access_token } = response.data;
      
      // 1. Salva o token no navegador (LocalStorage)
      localStorage.setItem('token', access_token);
      
      // 2. Redireciona para o Dashboard (que vamos criar jaja)
      router.push('/dashboard');

    } catch (err) {
      console.error(err);
      const error = err as AxiosError<{ detail: string }>; // 3. "Traduza" o erro para o TypeScript
      if (error.response) {
        // Erro que veio do backend (ex: 401 Senha errada)
        setError(error.response.data.detail || "Erro ao fazer login");
      } else {
        // Erro de conexão (ex: Backend desligado)
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false); // Desativa o spinner independente do resultado
    }
  };



  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError(""); setMsgSuccess(""); setIsLoadingAction(true);
    try{
      await api.post("/api/v1/forgot-password",{
      email: forgotMyPasswordEmail
      
    }, { })

    setMsgSuccess("Se o e-mail estiver cadastrado, enviamos um link para você.");
    setForgotMyPasswordEmail("")

    }catch (err){
      const error = err as AxiosError<{ detail: string }>;
      setMsgError(error.response?.data.detail || "Erro ao solicitar recuperação de senha.");
    }finally{
      setIsLoadingAction(false)
    }
  }
    

  const closeModal = () => {
    setIsForgotMyPasswordOpen(false);
    setMsgError("");
    setMsgSuccess("");
    setForgotMyPasswordEmail("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <main className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        
        {/* Botão de Voltar */}
        <Link href="/" className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-500 mb-2">Bem-vindo de volta!</h1>
          <p className="text-gray-400">Acesse sua conta para continuar.</p>
        </div>

        {/* Exibe mensagem de erro se houver */}
        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Input Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                placeholder="••••••••"
                required
                disabled={loading}
              />

              <button
                type="button" // Importante ser type="button" para não submeter o form
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

            </div>
          </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20 hover:cursor-pointer"
            >
              {loading ? (
                  <div className="flex flex-row justify-center items-center gap-4">
                  Entrando...
                  <Loader2 className="animate-spin"></Loader2>
                  </div>
              ) : (
                  "Entrar"
              )}
            </button>
            

        </form>

        <p className="mt-8 text-center text-gray-400">
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-green-400 hover:text-green-300 font-semibold hover:underline">
            Crie agora
          </Link>
        </p>
        <p onClick={() => setIsForgotMyPasswordOpen(true)} className="mt-4 text-center text-gray-400 cursor-pointer hover:text-green-400">
          Esqueci a senha
        </p>

      </main>

      <Modal isOpen={isForgotMyPasswordOpen} title="Esqueci a senha" onClose={closeModal} >
        <form onSubmit={handleForgotPassword}>
            {msgSuccess && <div className="p-2 mb-2 bg-green-500/20 text-green-400 rounded-lg text-sm">{msgSuccess}</div>}
            {msgError && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{msgError}</div>}

            <div className="relative">
              <Mail className="absolute left-3 top-6.5 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                value={forgotMyPasswordEmail}
                onChange={(e) => setForgotMyPasswordEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                placeholder="seu@email.com"
                required
                disabled={isLoadingAction}
              />

              <button type="submit" className="mt-4 bg-gray-800 p-2 rounded-xl hover:cursor-pointer hover:bg-green-500">
                {isLoadingAction ? <Loader2 className="animate-spin"></Loader2> : "Enviar"}
              </button>

            </div>
        </form>
      </Modal>
    </div>
  );
}