import os
import base64
import zipfile
import io

def setup_wallet():
    # 1. Pega o textão da variável de ambiente
    wallet_b64 = os.environ.get("ORACLE_WALLET_B64")
    
    if not wallet_b64:
        print("⚠️ Variável ORACLE_WALLET_B64 não encontrada. Pule se estiver local.")
        return

    print("🔐 Decodificando Wallet segura...")
    
    # 2. Cria a pasta wallet se não existir
    wallet_dir = "wallet" # Caminho relativo à raiz do backend
    if not os.path.exists(wallet_dir):
        os.makedirs(wallet_dir)

    # 3. Decodifica e salva o ZIP
    try:
        zip_data = base64.b64decode(wallet_b64)
        zip_file = io.BytesIO(zip_data)
        
        # 4. Extrai os arquivos
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            zip_ref.extractall(wallet_dir)
            
        print(f"✅ Wallet extraída com sucesso em: {os.path.abspath(wallet_dir)}")
        
        # Lista arquivos para confirmar (apenas debug)
        print("Arquivos:", os.listdir(wallet_dir))
        
    except Exception as e:
        print(f"❌ Erro ao extrair wallet: {e}")

if __name__ == "__main__":
    setup_wallet()