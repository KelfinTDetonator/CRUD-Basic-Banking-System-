const prisma = require('../../db')

async function createTransaction(sender, recipient, amountInt){
    const source = prisma.bank_accounts.update({
        where:{
            id: sender.id
        },
        data: {
            balance:{
                decrement: amountInt //transfer money to destination account, then decremented by amountInt
            } 
        }
    })

    const destination = prisma.bank_accounts.update({
        where:{
            id: recipient.id
        },
        data:{
            balance:{
                increment: amountInt //receive amountInt money from source account, then incremented
            }
        }
    })

    const transaction = prisma.bank_account_transactions.create({
        data:{
            source_account_id: sender.id,
            destination_account_id: recipient.id,
            amount: amountInt
        }
    })

    await prisma.$transaction([source, destination, transaction]) 
    return transaction;
}

async function findAllTransactions(){
    return await prisma.bank_account_transactions.findMany();
}

async function findTransactionById(id){
    const transaction = await prisma.bank_account_transactions.findUnique({
        where:{
            id: id,
        }
    })  
    return transaction
}

async function deleteTransactionById(id){
    const transaction = await prisma.bank_account_transactions.delete({
        where:{
            id
        }
    })
    return transaction
}

module.exports = {
    createTransaction,
    findAllTransactions,
    findTransactionById,
    deleteTransactionById
}