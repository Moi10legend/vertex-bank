import Image from "next/image"
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      {/* <h1 className="text-4xl font-bold mb-4">Vertex Bank 🏦</h1> */}
      <Image src="/vertex_bank_logo.png" alt="Vertex logo" width={500} height={300} priority className="h-auto"/>
      <p className="text-xl text-gray-400">O banco do futuro, segurança e agilidade em cada pixel.</p>
      
      <div className="flex flex-row gap-4">
        <Link href="/login">
          <button className="mt-8 px-6 py-3 
          bg-green-500 
          hover:bg-green-600 
          hover:cursor-pointer
          hover:scale-105
          active:scale-95
          rounded-lg 
          font-semibold 
          transition">
            Acessar Conta
          </button>
        </Link>
        <Link href="/register">
          <button className="mt-8 px-6 py-3 
          bg-transparent border-2 border-[#02FDB7]
          hover:bg-[#02FDB7]
          hover:scale-105
          hover: cursor-pointer
          active:scale-95
          rounded-lg 
          font-semibold 
          transition">
            Criar conta
          </button>
        </Link>
      </div>
    </main>
  );
}