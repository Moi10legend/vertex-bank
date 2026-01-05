"use client";

import { UserCircle2, ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";
import { User } from "@/app/dashboard/page"
import { Account } from "@/app/dashboard/page"
import { useEffect, useState } from "react";
import api from "@/app/src/services/api"
import { useRouter } from "next/navigation";


function Profile(){
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = async () => {
        const token = localStorage.getItem("token")
        if (!token) {router.push("/login"); return; }

        try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [userRes, accRes] = await Promise.all([
            api.get("/api/v1/users/me", config),
            api.get("/api/v1/users/account", config),
        ]);

        setUser(userRes.data);
        setAccount(accRes.data);
    } catch (error) {
        console.error("Erro ao atualizar dados", error);
    }
    }

    useEffect(() => {
        const init = async () => {
            await fetchData();
            setLoading(false);
        };
        init();
    })

    if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="animate-pulse text-xl font-semibold">Carregando seu banco...</div>
      </div>
    );
  }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col text-white">
            <Link href="/dashboard">
                <ArrowLeft size={20} className="m-4"></ArrowLeft>
            </Link>
            <main className="h-full flex items-center justify-center flex-col">
                
                <UserCircle2 size={120}></UserCircle2>
                <Camera className="hover:cursor-pointer"></Camera>
                    
                <section className="mt-4 border p-4 rounded-[10px]">
                    <h2 className="font-bold text-2xl">Nome</h2>
                    <p className="mt-2 text-white/80">{user?.full_name}</p>
                    <hr />
                    <h2 className="font-bold text-2xl mt-2 ">Número da conta</h2>
                    <p className="mt-2 text-white/80">{account?.number}</p>
                    <hr />
                    <h2 className="font-bold text-2xl">E-mail</h2>
                    <p className="mt-2 text-white/80">{user?.email}</p>
                    <hr />
                </section>
            </main>
        </div>
    )
}

export default Profile