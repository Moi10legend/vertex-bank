"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {AxiosError} from "axios";
import api from "@/app/src/services/api"
import { 
  LogOut, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History,
  User as UserIcon,
  Loader2
} from "lucide-react";
import { Modal } from "../src/components/modal";

// Tipagem básica dos dados que virão do backend
interface User {
  full_name: string;
  email: string;
}

interface Transaction {
  id: number;
  transaction_type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  description: string;
  data: string;
}

interface Account{
  number: string,
  balance: number
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false); // Trava botões durante envio

  const [amount, setAmount] = useState(""); // Usamos string para facilitar o input, depois convertemos
  const [transferTarget, setTransferTarget] = useState("");
  const [description, setDescription] = useState("");
  const [msgError, setMsgError] = useState("");
  const [msgSuccess, setMsgSuccess] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userRes, accRes, transRes] = await Promise.all([
            api.get("/api/v1/users/me", config),
            api.get("/api/v1/users/account", config),
            api.get("/api/v1/transactions/", config)
        ]);

        setUser(userRes.data);
        setAccount(accRes.data);
        setTransactions(transRes.data);
    } catch (error) {
        console.error("Erro ao atualizar dados", error);
    }
  };

  // Função de Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    const init = async () => {
        await fetchData();
        setLoading(false);
    };
    init();
  }, []);

  // --- FUNÇÃO DE DEPÓSITO ---
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError(""); setMsgSuccess(""); setLoadingAction(true);

    try {
        const token = localStorage.getItem("token");
        await api.post("/api/v1/transactions/transaction", {
            amount: parseFloat(amount),
            transaction_type: "deposit",
            description: "Depósito via App"
        }, { headers: { Authorization: `Bearer ${token}` } });

        setMsgSuccess("Depósito realizado com sucesso!");
        setAmount(""); // Limpa input
        await fetchData(); // Atualiza saldo na tela
        setTimeout(() => { setIsDepositOpen(false); setMsgSuccess(""); }, 1500); // Fecha modal

    } catch (err) {
        const error = err as AxiosError<{ detail: string }>;
        setMsgError(error.response?.data.detail || "Erro ao depositar.");
    } finally {
        setLoadingAction(false);
    }
  };

  // --- FUNÇÃO DE TRANSFERÊNCIA ---
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError(""); setMsgSuccess(""); setLoadingAction(true);

    try {
        const token = localStorage.getItem("token");
        // Nota: A rota de transferência é diferente (/transfer)
        await api.post("/api/v1/transactions/transfer", {
            target_account_number: transferTarget,
            amount: parseFloat(amount),
            description: description
        }, { headers: { Authorization: `Bearer ${token}` } });

        setMsgSuccess("Transferência enviada!");
        setAmount(""); setTransferTarget(""); setDescription("");
        await fetchData();
        setTimeout(() => { setIsTransferOpen(false); setMsgSuccess(""); }, 1500);

    } catch (err) {
        const error = err as AxiosError<{ detail: string }>;
        setMsgError(error.response?.data.detail || "Erro na transferência.");
    } finally {
        setLoadingAction(false);
    }
  };

  // Limpa formulários ao fechar modal
  const closeModal = () => {
    setIsDepositOpen(false);
    setIsTransferOpen(false);
    setMsgError("");
    setMsgSuccess("");
    setAmount("");
    setTransferTarget("");
    setDescription("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-semibold">Carregando seu banco...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* --- HEADER --- */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-2 rounded-lg">
                <Wallet className="text-green-500" size={24} />
            </div>
            <span className="font-bold text-xl">Vertex Bank</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-medium text-white">{user?.full_name}</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
                title="Sair"
            >
                <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Card Principal */}
            <div className="bg-linear-to-br from-green-600 to-green-800 rounded-2xl p-6 shadow-xl shadow-green-900/20">
                <h2 className="text-green-100 font-medium mb-1">Saldo Total</h2>
                <div className="text-3xl font-bold mb-4">
                    R$ {Number(account?.balance)?.toFixed(2)} 
                </div>
                <div className="flex gap-3">
                    <button 
                    className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-semibold transition backdrop-blur-sm"
                    onClick={() => setIsDepositOpen(true)}>
                      Depositar
                    </button>
                    <button 
                    className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-semibold transition backdrop-blur-sm"
                    onClick={() => setIsTransferOpen(true)}>
                      Transferir
                    </button>
                </div>
            </div>

            {/* Atalhos Rápidos */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-center gap-4">
                 <span className="text-gray-400 text-sm">Acesso Rápido</span>
                 <div className="flex justify-between">
                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition">
                        <div className="bg-gray-800 p-3 rounded-full text-green-400"><ArrowUpCircle /></div>
                        <span className="text-xs">Entradas</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition">
                         <div className="bg-gray-800 p-3 rounded-full text-red-400"><ArrowDownCircle /></div>
                        <span className="text-xs">Saídas</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition">
                         <div className="bg-gray-800 p-3 rounded-full text-blue-400"><UserIcon /></div>
                        <span className="text-xs">Perfil</span>
                    </div>
                 </div>
            </div>
        </section>

        {/* --- EXTRATO --- */}
        <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <History className="text-gray-500" />
                    Últimas Transações
                </h3>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Nenhuma movimentação encontrada.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {transactions.map((t) => (
                            <div key={t.id} className="p-4 hover:bg-gray-800/50 transition flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${
                                        t.transaction_type === 'deposit' ? 'bg-green-500/10 text-green-500' : 
                                        t.transaction_type === 'withdraw' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        {t.transaction_type === 'deposit' ? <ArrowUpCircle size={20}/> : 
                                         t.transaction_type === 'withdraw' ? <ArrowDownCircle size={20}/> : <Wallet size={20}/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold capitalize text-gray-200">
                                            {t.transaction_type == 'transfer' ? 'Transferência' : t.transaction_type == 'deposit' ? 'Depósito' : 'Saque'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {t.description || "Sem descrição"}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {new Date(t.data).toLocaleDateString('pt-BR')} às {new Date(t.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold ${
                                    t.transaction_type === 'deposit' || (t.transaction_type === 'transfer' && t.description?.includes('Recebido')) 
                                    ? 'text-green-400' 
                                    : 'text-gray-200'
                                }`}>
                                    {t.transaction_type === 'deposit' ? '+ ' : '- '}
                                    R$ {Number(t.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>

      </main>

      <Modal isOpen={isDepositOpen} onClose={closeModal} title="Fazer um Depósito">
        <form onSubmit={handleDeposit} className="space-y-4">
            {msgSuccess && <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">{msgSuccess}</div>}
            {msgError && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{msgError}</div>}
            
            <div>
                <label className="text-sm text-gray-400">Valor (R$)</label>
                <input 
                    type="number" step="0.01" min="0.01" required
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0,00"
                />
            </div>
            <button disabled={loadingAction} type="submit" className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition flex justify-center items-center">
                {loadingAction ? <Loader2 className="animate-spin"/> : "Confirmar Depósito"}
            </button>
        </form>
      </Modal>

      {/* --- MODAL DE TRANSFERÊNCIA --- */}
      <Modal isOpen={isTransferOpen} onClose={closeModal} title="Transferir Valores">
        <form onSubmit={handleTransfer} className="space-y-4">
            {msgSuccess && <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm">{msgSuccess}</div>}
            {msgError && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{msgError}</div>}
            
            <div>
                <label className="text-sm text-gray-400">Conta de Destino (Número)</label>
                <input 
                    type="text" required
                    value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ex: 10002"
                />
            </div>
            
            <div>
                <label className="text-sm text-gray-400">Valor (R$)</label>
                <input 
                    type="number" step="0.01" min="0.01" required
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0,00"
                />
            </div>

            <div>
                <label className="text-sm text-gray-400">Descrição (Opcional)</label>
                <input 
                    type="text"
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ex: Pagamento Aluguel"
                />
            </div>

            <button disabled={loadingAction} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition flex justify-center items-center">
                {loadingAction ? <Loader2 className="animate-spin"/> : "Confirmar Transferência"}
            </button>
        </form>
      </Modal>
    </div>
  );
}