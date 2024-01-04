// modulos externos
import inquirer  from 'inquirer'
import chalk from 'chalk'

// modulos internos
import fs from 'fs'

operation()


// Função para as realizações
function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    },
    ])
    .then((answer) => {
        const action = answer['action']

        if (action === 'Criar Conta') {
            createAccount()
        } else if (action === 'Depositar') {
            deposit()

        } else if (action === 'Consultar Saldo') {
            getAccountBalance()

        } else if (action === 'Sacar') {
            withdraw()

        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar nosso banco!'))
            process.exit()
        }
    })
    .catch(err => console.log(err))
}

// Criação de conta
function createAccount() {
    console.log(chalk.bgGreen.black('=== Parabéns por escolher o nosso Banco! ==='))
    console.log('=~'.repeat(20))
    console.log(chalk.green('-Defina as opções da sua conta a seguir:'))

    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta: '
        }
    ]).then(answer => {
        const accountName = answer['accountName']

        console.info(accountName)

        // Criando diretório para salvar os nomes
        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        // Verificando a existencia da conta
        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Está conta já existe. Escolha outro nome!')
            )
            buildAccount()
            return
        }

        // Escrevendo o nome da conta em um arquivo JSON
        fs.writeFileSync(
            `accounts/${accountName}.json`, 
            '{"balance": 0}',
            function (err) {
                console.log(err)
            },
        )

        console.log(chalk.green('Parabéns, a sua conta foi criada com SUCESSO!!'))
        operation()
    })
    .catch((err) => console.log(err))
}

// Colocando dinheiro na conta da usuario
function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta? '
        }
    ])
    .then((answer) => {

        const accountName = answer['accountName']
        // Verificando se a conta existe
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt({
            name: 'amount',
            message: 'Qual o valo do deposito R$: '
        }).then((answer) => {

            const amount = answer['amount']
            
            addAmount(accountName, amount)
            operation()

        }).catch(err => console.log(err))


    })
    .catch(err => console.log(err))
}


// função para verificar conta existente

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Conta inexistente! Escolha outra por favor...'))
        return false
    }

    return true
}

function addAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente!'))
        return deposit()
    }
    
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        },
    )
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta`),
    )
}

// Lendo arquivo
function getAccount(accountName) {
    const accountPath = `accounts/${accountName}.json`;

    if (!fs.existsSync(accountPath)) {
        console.log(chalk.bgRed.black('Conta inexistente! Escolha outra por favor...'));
        return false;
    }

    const accountJSON = fs.readFileSync(accountPath, { encoding: 'utf8', flag: 'r' });

    return JSON.parse(accountJSON);
}


// Consulta de Saldo
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta:'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']

        // Se a conta existe
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Olá, o saldo da sua conta é de R$${chalk.green(accountData.balance)}`
        ),
    )
    operation()

    }).catch(err => console.log(err))
}


// Sacar Dinheiro
function withdraw() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Valor a ser sacado R$:'
            }
        ]).then((answer) =>{
            const amount = answer['amount']

            removeAmount(accountName, amount)
        })
        .catch(err => console.log(err))

    })
    .catch(err => console.log()(err))

}


function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return withdraw()
    }

    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponivel para saque... :('))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )
    console.log(chalk.green(`Foi realizado o saque de R$${amount} na sua conta!`))
    operation()
}