from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api import deps
from app.core.db import get_session
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction, TransactionType
from app.schemas.transaction import TransactionCreate, TransactionPublic, TransferCreate

router = APIRouter()

@router.post("/transaction", response_model=TransactionPublic)
async def make_transaction(
    trans_in: TransactionCreate,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(get_session)):
    query = select(Account).where(Account.user_id == current_user.id)
    result = await session.exec(query)
    account = result.first()

    if not account:
        raise HTTPException(status_code=404, detail="Conta não encontrada para este usuário.")
    
    if trans_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Valor não pode ser menor ou igual a zero.")
    
    if trans_in.transaction_type == TransactionType.DEPOSIT:
        account.balance += trans_in.amount
    elif trans_in.transaction_type == TransactionType.WITHDRAW:
        if account.balance < trans_in.amount:
            raise HTTPException(status_code=400, detail="O valor é maior que o disponível na conta")
        
        account.balance -= trans_in.amount

    transaction = Transaction(
        amount = trans_in.amount,
        account_id = account.id,
        transaction_type = trans_in.transaction_type,
        description = trans_in.description
    )

    session.add(transaction) # Salva o extrato
    session.add(account)     # Atualiza o saldo
    
    # 6. Efetiva tudo de uma vez
    await session.commit()
    await session.refresh(transaction)

    return transaction

@router.post("/transfer", response_model=TransactionPublic)
async def create_transfer(
    transfer_in: TransferCreate,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(get_session)):

    query_source = select(Account).where(Account.user_id == current_user.id)
    result_source = await session.exec(query_source)
    source_account = result_source.first()

    if not source_account:
        raise HTTPException(status_code=404, detail="Sua conta não foi encontrada.")
    
    query_target = select(Account).where(Account.number == transfer_in.target_account_number)
    result_target = await session.exec(query_target)
    target_account = result_target.first()

    if not target_account:
        raise HTTPException(status_code=404, detail="Conta de destino não encontrada.")

    if source_account.id == target_account.id:
        raise HTTPException(status_code=400, detail="Você não pode transferir para si mesmo.")

    if transfer_in.amount <= 0:
        raise HTTPException(status_code=400, detail="O valor deve ser positivo.")

    if source_account.balance < transfer_in.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente para transferência.")
    
    #Retira o dinheiro da conta do remetente
    source_account.balance -= transfer_in.amount

    transaction_out = Transaction(
        account_id=source_account.id,
        transaction_type=TransactionType.TRANSFER,
        amount=transfer_in.amount,
        description=f"Envio para {target_account.number}: {transfer_in.description or ''}",
    )

    #Adiciona o valor ao Destinatário
    target_account.balance += transfer_in.amount

    transaction_in = Transaction(
        account_id=target_account.id,
        transaction_type=TransactionType.TRANSFER,
        amount=transfer_in.amount,
        description=f"Recebido de {source_account.number}: {transfer_in.description or ''}"
    )

    session.add(source_account)
    session.add(target_account)
    session.add(transaction_out)
    session.add(transaction_in)

    await session.commit()
    await session.refresh(transaction_out)

    # Retorna o comprovante de quem enviou
    return transaction_out

@router.get("/", response_model=list[TransactionPublic])
async def get_transactions(
    skip=0,
    limit=100,
    current_user: User = Depends(deps.get_current_user), 
    session: AsyncSession = Depends(get_session)):
    
    query_account = select(Account).where(Account.user_id == current_user.id)
    response_account = await session.exec(query_account)
    account = response_account.first()

    if not account:
        raise HTTPException(status_code=404, detail="Conta não encontrada.")
    
    query = select(Transaction)\
        .where(Transaction.account_id == account.id)\
        .order_by(Transaction.data.desc())\
        .offset(skip)\
        .limit(limit)
    
    result = await session.exec(query)
    transactions = result.all()

    return transactions