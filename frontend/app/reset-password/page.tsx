"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/app/src/services/api"
import {AxiosError} from "axios";
import Link from "next/link";
import { ArrowLeft } from "lucide-react"

function ResetPasswordForm(){
    const searchParams = useSearchParams();
    const router = useRouter();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Link inválido ou expirado. Tente solicitar novamente.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Token de recuperação não encontrado.");
            setLoading(false);
            return;
        }

        try{
            await api.post("api/v1/reset-password",
                {
                    token: token,
                    new_password: password,
                    confirm_password: confirmPassword
                }
            )

            setSuccess(true);
            
            // 3. Redirecionar para login após 3 segundos
            setTimeout(() => {
                router.push("/login");
            }, 3000);

        }catch(err){
            const error = err as AxiosError<{ detail: string }>;
            setError(error.response?.data.detail || "Erro ao redefinir senha.");
        } finally {
            setLoading(false);
        }
        }

        if (success) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-2">Senha Alterada!</h2>
                <p>Sua senha foi redefinida com sucesso.</p>
                <p className="text-sm text-gray-500 mt-2">Redirecionando para o login...</p>
            </div>
        );
    }

    return(
        
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
            <Link href="/login" className="flex items-center text-gray-800 hover:text-gray-500 mb-6 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
                Voltar
            </Link>
            <h1 className="text-2xl font-bold mb-6 text-center">Redefinir Senha</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Insira sua nova senha"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Input Confirmar Senha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                        required
                        className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Checkbox Mostrar Senha */}
                <div className="flex items-center">
                    <input
                        id="show-pass"
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                        className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="show-pass" className="ml-2 text-sm text-gray-600 cursor-pointer">
                        Mostrar senhas
                    </label>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-blue-700 text-white py-2 rounded hover:bg-[#02FDB7] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Redefinindo..." : "Salvar Nova Senha"}
                </button>
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        // O fallback é o que aparece enquanto o Next tenta ler a URL
        <Suspense fallback={<div className="text-center mt-10">Carregando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}