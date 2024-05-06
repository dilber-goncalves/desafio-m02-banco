const bancoDeDados = require('../bancodedados');
const { format } = require('date-fns');

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "Informar número da conta e valor!" })
    }

    const { contas, depositos } = bancoDeDados;
    const encontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!encontrada) {
        return res.status(404).json({ mensagem: "Conta não foi encontrada!" });
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Verifique o valor! Não pode ser menor que 0" });
    }

    encontrada.saldo += valor;

    const registroDeposito = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta,
        valor
    }

    depositos.push(registroDeposito);

    return res.status(201).send();
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "Número da conta, valor e senha são obrigatórios!" })
    }

    const { contas, saques } = bancoDeDados;
    const encontrada = contas.find(conta => Number(conta.numero) === Number(numero_conta));

    if (!encontrada) {
        return res.status(404).json({ mensagem: "Conta não foi encontrada!" });
    }

    if (encontrada.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: "Senha incorreta!" });
    }

    if (encontrada.saldo < valor) {
        return res.status(403).json({ mensagem: "Saldo insuficiente!" });
    }

    encontrada.saldo -= valor;

    const registroSaque = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta,
        valor
    }

    saques.push(registroSaque);

    return res.status(201).send();
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: "Contas, valor e senha são obrigatórios!" })
    }

    const { contas, transferencias } = bancoDeDados;
    const contaOrigem = contas.find(conta => Number(conta.numero) === Number(numero_conta_origem));

    if (!contaOrigem) {
        return res.status(404).json({ mensagem: "Conta de origem não foi encontrada!" });
    }

    const contaDestino = contas.find(conta => Number(conta.numero) === Number(numero_conta_destino));

    if (!contaDestino) {
        return res.status(404).json({ mensagem: "Conta de destino não foi encontrada!" });
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: "Senha incorreta!" });
    }

    if (contaOrigem.saldo < valor) {
        return res.status(403).json({ mensagem: "Saldo insuficiente!" });
    }

    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    const registroTransferencia = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    transferencias.push(registroTransferencia);
    return res.status(201).send();
}

module.exports = {
    depositar, sacar, transferir
}