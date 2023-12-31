const accRepos = require('../bankAccounts/account.repository')

const tranService = require('./transaction.service');
const userService = require('../users/user.service');

//create transaction
async function createTransaction(req, res){
    try {
        const {source_account_id, destination_account_id, amount } = req.body;
        const senderId = parseInt(source_account_id), recipientId = parseInt(destination_account_id);
        const amountInt = parseInt(amount)

        const sender = await accRepos.findBankAccById(senderId)
        const recipient = await accRepos.findBankAccById(recipientId)
        
        if(!(sender && recipient)){
            const user = (sender) ? "Destination account" : "Source account";
            res.status(404).send(`${user} not found!`)
        }
        sender.id = parseInt(senderId)
        recipient.id = parseInt(recipientId)

        const transaction = await tranService.createTransaction(sender, recipient, amountInt)
        res.status(201).json({
            data: transaction,
            message: "Transaction successful"
        })

    } catch (error) {
        res.status(400).send(error.message)
    }
}

//get all transactions info
async function getAllTransactions(req, res){
    try {
        const transactions = await tranService.getAllTransactions()
        
        for (const transaction of transactions) {
            if(typeof transaction.amount === 'bigint'){
                transaction.amount = parseInt(transaction.amount)
                transactions.amount = transaction.amount
            }
        }

        res.status(200).json({
            data: transactions,
            message: "fetch transactions data success"
        })
    } catch (error) {
        res.status(400).send(error.message)
    }
}

async function getTransactionById(req, res){
    try {
    const transactionId = +req.params.transactionId;

    if(typeof transactionId !== 'number'){
        throw Error ("ID must be a number")
    }
    //gett transaction info, if not exist then error
    const transaction = await tranService.getTransactionById(transactionId)
    
    const senderId      = +transaction.source_account_id;
    const destinationId = +transaction.destination_account_id;

    //account, if not exist then error
    const senderAcc = await accRepos.findBankAccById(senderId);
    const recipientAcc = await accRepos.findBankAccById(destinationId);

    if(!(senderAcc && recipientAcc)){
        const user = (senderAcc) ? "Destination account" : "Source account";
        res.status(404).send(`${user} not found!`)
    }

    //users id
    const senderUserId = parseInt(senderAcc.user_id)
    const recipientUserId = parseInt(recipientAcc.user_id)

    //getting user (sender, recipient), if nnot exist then error
    const senderUser = await userService.getUserById(senderUserId)
    const recipientUser = await userService.getUserById(recipientUserId)

    //detail transaction connected with sender and recipient account info
    transaction["source_account_info"] = {
        id: senderUser.id,
        name: senderUser.name,
    }

    transaction["destination_account_info"] = {
        id: recipientUser.id,
        name: recipientUser.name
    }

    transaction.amount = parseInt(transaction.amount)
    res.status(200).json({
        data: transaction,
        message: "Fetch transaction data success"
    });

    } catch (error) {
        if(error.statusCode === 404) { //not found
            res.status(404).send(error.message)
        } else {    //bad syntax
            res.status(400).send(error.message)
        }
    }
}

async function deleteTransactionById(req, res){
    try {
        const transactionId = +req.params.transactionId;

        if(typeof transactionId !== 'number'){
            throw Error ("ID must be a number")
        }
        
        await tranService.deleteTransactionById(transactionId);
        res.status(200).json({
            message: "Transaction deleted"
        })
        
    } catch (err) {
        if(err.statusCode === 404) { //not found
            res.status(404).json( { error: err.message } )
        } else {    //bad syntax
            res.status(400).json( { error: err.message } )
        }
    }
}

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    deleteTransactionById,
}