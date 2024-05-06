let { banco, contas, id, saques, depositos, transferencias } = require('../bancodedados');

const verificarContaSenha = (numeroConta, senha, res) => {
    const encontrado = contas.find(conta => Number(conta.numero) === Number(numeroConta));

    if (!encontrado) {
        return res.status(404).json({ mensagem: 'Conta não encontrada!' });
    }

    if (encontrado.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'Senha incorreta!' });
    }

    return encontrado;
};

const listaDeContas = (req, res) => {
    const { senha_banco } = req.query;
    if (!senha_banco) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória!' });
    }

    if (senha_banco !== banco.senha) {
        return res.status(400).json({ mensagem: 'Senha incorreta!' });
    }

    return res.status(200).json(contas);
};

let criarConta = (req, res) => {
    const { nome, email, cpf, data_nascimento, telefone, senha } = req.body;
    if (![nome, email, cpf, data_nascimento, telefone, senha].every(Boolean)) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios' });
    }

    const contaRepetida = contas.some(conta => conta.usuario.cpf === cpf || conta.usuario.email === email);
    if (contaRepetida) {
        return res.status(400).json({ mensagem: 'Dados já existentes' });
    }

    const novaConta = {
        numero: id++,
        saldo: 0,
        usuario: { nome, cpf, data_nascimento, telefone, email, senha }
    };

    contas.push(novaConta);
    return res.status(201).send();
};

const atualizarUsuario = (req, res) => {
    const { nome, email, cpf, data_nascimento, telefone, senha } = req.body;
    const { numeroConta } = req.params;

    if (![nome, email, cpf, data_nascimento, telefone, senha].every(Boolean)) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios' });
    }

    const encontrado = verificarContaSenha(numeroConta, senha, res);
    if (!encontrado) return;

    if (cpf !== encontrado.usuario.cpf && contas.some(conta => conta.usuario.cpf === cpf)) {
        return res.status(400).json({ mensagem: 'CPF já cadastrado' });
    }

    if (email !== encontrado.usuario.email && contas.some(conta => conta.usuario.email === email)) {
        return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }

    encontrado.usuario = { nome, email, cpf, data_nascimento, telefone, senha };

    return res.status(204).send();
};

const excluirConta = (req, res) => {
    const { numeroConta } = req.params;
    const encontrado = verificarContaSenha(numeroConta, req.body.senha, res);
    if (!encontrado) return;

    if (encontrado.saldo > 0) {
        return res.status(403).json({ mensagem: 'Conta não pode ser excluída pois ainda há saldo' });
    }

    contas = contas.filter(conta => Number(conta.numero) !== Number(numeroConta));
    return res.status(204).send();
};

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Informar número da conta e senha!' });
    }

    const encontrado = verificarContaSenha(numero_conta, senha, res);
    if (!encontrado) return;

    return res.status(200).json({ saldo: encontrado.saldo });
};

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Informar número da conta e senha!' });
    }

    const encontrado = verificarContaSenha(numero_conta, senha, res);
    if (!encontrado) return;

    const totalDeDepositos = depositos.filter(deposito => deposito.numero_conta === Number(numero_conta));
    const totalDeSaques = saques.filter(saque => saque.numero_conta === Number(numero_conta));
    const transferenciasEnviadas = transferencias.filter(transferencia => transferencia.numero_conta === Number(numero_conta));
    const transferenciasRecebidas = transferencias.filter(transferencia => transferencia.numero_conta === Number(numero_conta));

    return res.status(200).json({
        depositos: totalDeDepositos,
        saques: totalDeSaques,
        transferenciasEnviadas,
        transferenciasRecebidas
    });
};

module.exports = {
    listaDeContas,
    criarConta,
    atualizarUsuario,
    excluirConta,
    saldo,
    extrato
};
