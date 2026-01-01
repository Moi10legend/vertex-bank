"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <--- Para redirecionar o usuário
import { AxiosError } from "axios"; // <--- Para falar com o Backend
import api from "@/app/src/services/api"
import Link from "next/link";
import { ArrowLeft, Mail, User2, Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage(){
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(""); // Para mostrar msg de erro
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Para travar o botão enquanto carrega
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true)

    try{
      if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return; // O return é CRUCIAL: ele para a função aqui e não deixa enviar pro backend
    }

    // --- 2. VALIDAÇÃO: TAMANHO DA SENHA (OPCIONAL MAS RECOMENDADO) ---
    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

      await api.post('/api/v1/users/', {
        email: email,
        full_name: name,
        password: password,
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    
    }catch (err){
      console.error(err);
      const error = err as AxiosError<{ detail: string }>; // 3. "Traduza" o erro para o TypeScript
      if (error.response) {
        // Erro que veio do backend (ex: 401 Senha errada)
        setError(error.response.data.detail || "Erro ao criar conta");
      } else {
        // Erro de conexão (ex: Backend desligado)
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false); // Desativa o spinner independente do resultado
    }
  } 

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-green-500/50 text-center">
            <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-green-500 mb-2">Conta Criada!</h2>
            <p className="text-gray-400">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <main className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">

        {/* Botão de Voltar */}
        <Link href="/" className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#02FDB7] mb-2">Crie sua conta</h1>
          <p className="text-gray-400">Entre para o futuro.</p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome completo</label>
            <div className="relative">
              <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20}/>
              <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#02FDB7] focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
              placeholder="Seu nome aqui"
              disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#02FDB7] focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                placeholder="seu@email.com"
                required
                disabled={loading}/>
            </div>
          </div>
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
              <div>
                {}
              </div>

            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirme a senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-500"
                placeholder="••••••••"
                required
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
              type="submit"
              className="w-full py-3 bg-[#02FDB7] hover:bg-[#04d69b] text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-900/20 hover:cursor-pointer"
            >
              {loading ? (
                  <div className="flex flex-row justify-center items-center gap-4">
                  Entrando...
                  <Loader2 className="animate-spin"></Loader2>
                  </div>
              ) : (
                  "Cadastrar"
              )}
            </button>
        </form>
        <p className="mt-8 text-center text-gray-400">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-green-400 hover:text-green-300 font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </main>
    </div>
  )
}