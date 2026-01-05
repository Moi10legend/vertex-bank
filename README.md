# 🏦 Vertex Bank System

> Um sistema bancário Full Stack moderno, seguro e escalável, desenvolvido com foco em arquitetura em nuvem e segurança de dados.

[![Deploy Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://vertex-bank-api.onrender.com/docs)
[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vertex-bank-blue.vercel.app)
[![Database](https://img.shields.io/badge/Database-Oracle_26ai-F80000?style=for-the-badge&logo=oracle&logoColor=white)](https://www.oracle.com/database/)

## 🚀 Sobre o Projeto

O **Vertex Bank** é uma aplicação completa que simula as operações essenciais de um banco digital. O objetivo principal deste projeto foi construir uma arquitetura robusta integrando um **Frontend moderno** com um **Backend de alta performance**, conectados a um **Banco de Dados Autônomo na Nuvem** com recursos de IA.

Diferente de projetos acadêmicos comuns, o Vertex Bank implementa **segurança real** utilizando conexão via mTLS (Mutual TLS) com Carteira Digital (Wallet) para acesso ao banco de dados.

### ✨ Funcionalidades

* **Autenticação Segura:** Login e Registro com JWT (JSON Web Tokens) e Hashing de senhas.
* **Gestão de Contas:** Criação automática de conta bancária via Triggers de Banco de Dados.
* **Transações em Tempo Real:** Depósitos e Transferências entre contas (TED/Pix simulado).
* **Dashboard Interativo:** Visualização de saldo e extrato detalhado.
* **Infraestrutura Cloud:** Banco de dados, API e Frontend 100% hospedados na nuvem.

---

## 🛠️ Tech Stack

### Backend (API)
* **Linguagem:** Python 3.12+
* **Framework:** FastAPI (Assíncrono)
* **ORM:** SQLModel / SQLAlchemy
* **Banco de Dados:** Oracle Autonomous Database 26ai (Versão mais recente com recursos nativos de IA)
* **Segurança:** Oracle Wallet (mTLS), OAuth2 com JWT
* **Deploy:** Render (Dockerizado)

### Frontend (Interface)
* **Framework:** Next.js 16 (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS
* **Consumo de API:** Axios
* **Deploy:** Vercel

---

## 🏗️ Arquitetura e Desafios Superados

Um dos maiores desafios deste projeto foi a configuração de **mTLS (Mutual TLS)** em um ambiente Serverless (Render).
* A conexão com o Oracle Cloud exige certificados digitais (`cwallet.sso`).
* Foi implementada uma injeção segura de credenciais via Variáveis de Ambiente codificadas em Base64, permitindo que a aplicação se autentique no banco sem expor arquivos sensíveis no repositório.

---

## 💻 Como Rodar Localmente

### Pré-requisitos
* Python 3.12+
* Node.js 18+
* Conta na Oracle Cloud (para o banco de dados)

### 1. Backend
```bash
cd backend
poetry install
# Crie um arquivo .env com suas credenciais (veja .env.example)
poetry run uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
# Crie um arquivo .env.local com a URL da API
npm run dev
```

## 🔗 Links
Aplicação (Live Demo): [Acesse o Vertex Ban](https://vertex-bank-blue.vercel.app/)

Documentação da API (Swagger): [Ver Docs](https://www.google.com/url?sa=E&source=gmail&q=https://vertex-bank-api.onrender.com/docs)

Desenvolvido por Moisés 🚀
