let totalGeral = 0;

goValuesTable()
async function goValuesTable() {
    try {
        const online = await isOnline();
        if (online) {
            document.getElementById('tableFinanceiro').hidden = false;
            await buscaBatePontoDbOnline();
        } else {
            document.getElementById('tableFinanceiro').hidden = true;
            document.getElementById('avisoConnection').hidden = false;
            document.getElementById('mesSelected').disabled = true;
            document.getElementById('anoSelected').disabled = true;
        }
    } catch (error) {
        console.error('Erro ao verificar conexão:', error);
    }
}

async function buscaBatePontoDbOnline() {
    try {
        totalGeral = 0;

        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/buscaInfoTableFinanceiro2/';
        const user = await getUsers();
        const dadosUser = JSON.parse(user);

        const params = new URLSearchParams({
            id_colaborador: dadosUser[0].values[0][1],
            mes: document.getElementById('mesSelected').value,
            ano: document.getElementById('anoSelected').value
        }).toString();

        const response = await fetch(`${apiUrl}?${params}`);
        if (!response.ok) throw new Error('Erro na requisição: ' + response.statusText);

        const data = await response.json();

        if (data.status !== 'erro') {
            if (data.arr) {
                document.getElementById('avisoBatePonto').innerHTML = ''
                document.getElementById('body').innerHTML = data.arr

                document.getElementById('sppiner').hidden = false

                document.getElementById('fechamentoElement').hidden = false;
                calculaTableFechamento(data.total)

            } else {
                document.getElementById('body').innerHTML = ''
                document.getElementById('sppiner').hidden = true
                document.getElementById('avisoBatePonto').innerHTML = 'Nenhum registro encontrado.';
                document.getElementById('fechamentoElement').hidden = true;
            }
        } else {
            document.getElementById('body').innerHTML = ''
            document.getElementById('sppiner').hidden = true
            console.log('Erro na resposta da API:', data);
            document.getElementById('avisoBatePonto').innerHTML = 'Nenhum registro encontrado.';
            document.getElementById('fechamentoElement').hidden = true;
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function saveHoraExtras(id_bateponto) {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/saveHoraExtra/';
        const horasExtras = Number(document.getElementById('horas_extras' + id_bateponto).value);

        console.log(id_bateponto, horasExtras);

        const params = new URLSearchParams({
            id_bateponto: id_bateponto,
            horas_extras: horasExtras
        }).toString();

        const response = await fetch(`${apiUrl}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        location.reload()

    } catch (error) {
        console.error('Erro:', error);
    }
}

async function calculaTableFechamento(total) {
    try {
        document.getElementById('sppiner').hidden = true
        document.getElementById('fechamentoElement').hidden = false

        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/buscaFechamento/';
        const user = await getUsers(); // Obtém o usuário
        const dadosUser = JSON.parse(user);

        document.getElementById('valor_carteira').innerHTML = dadosUser[0].values[0][10].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

        const params = new URLSearchParams({
            id_colaborador: dadosUser[0].values[0][1],
            mes: document.getElementById('mesSelected').value,
            ano: document.getElementById('anoSelected').value
        }).toString();

        const response = await fetch(`${apiUrl}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        const data = await response.json();

        console.log(data);

        if (data.status !== 'erro') {
            const fechamento_horas = JSON.parse(data.fechamento_horas);

            if (fechamento_horas.length > 0) {
                const fechamento_hora = fechamento_horas[0]; // Considerando o primeiro registro
                let fgts = 0,
                    inss = 0,
                    irrf = 0,
                    convenio = 0,
                    outros_descontos = 0,
                    adiantamento = 0,
                    valor_nf = 0;

                // Atualiza valores e formata
                fgts = fechamento_hora.fgts ? formatCurrencyToFloat(fechamento_hora.fgts) : 0;
                inss = fechamento_hora.inss ? formatCurrencyToFloat(fechamento_hora.inss) : 0;
                irrf = fechamento_hora.irrf ? formatCurrencyToFloat(fechamento_hora.irrf) : 0;
                convenio = fechamento_hora.convenio ? formatCurrencyToFloat(fechamento_hora.convenio) : 0;
                outros_descontos = fechamento_hora.outros_descontos ? formatCurrencyToFloat(fechamento_hora.outros_descontos) : 0;
                adiantamento = fechamento_hora.adiantamento ? formatCurrencyToFloat(fechamento_hora.adiantamento) : 0;
                valor_nf = fechamento_hora.valor_nf ? formatCurrencyToFloat(fechamento_hora.valor_nf) : 0;

                let totalGeral = total - (fgts + inss + irrf + convenio + outros_descontos + adiantamento + valor_nf);

                // Atualiza a interface com os valores formatados
                document.getElementById('fgts').innerHTML = (fgts == 0 ? '' : fgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('inss').innerHTML = (inss == 0 ? '' : inss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('irrf').innerHTML = (irrf == 0 ? '' : irrf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('convenio').innerHTML = (convenio == 0 ? '' : convenio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('outros_descontos').innerHTML = (outros_descontos == 0 ? '' : outros_descontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('adiantamento').innerHTML = (adiantamento == 0 ? '' : adiantamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('valor_nf').innerHTML = (valor_nf == 0 ? '' : valor_nf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
                document.getElementById('total_receber_desconto').innerHTML = (totalGeral == 0 ? '' : totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
            }
        } else {
            // Caso de erro, mostra o total original
            document.getElementById('total_receber_desconto').innerHTML = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

function parseCurrency(value) {
    // Remove o símbolo de moeda, espaços e entidades HTML
    const cleanedValue = value
        .replace(/R\$|\s|&nbsp;/g, '') // Remove "R$", espaços e &nbsp;
        .replace(/\./g, '') // Remove os pontos (milhares)
        .replace(',', '.'); // Troca a vírgula pelo ponto decimal
    return parseFloat(cleanedValue);
}

function getDayOfWeek(dateString) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
}

function subtractTime(time1, time2) {
    const time1Parts = time1.split(':');
    const time2Parts = time2.split(':');

    const date1 = new Date(0, 0, 0, time1Parts[0], time1Parts[1]);
    const date2 = new Date(0, 0, 0, time2Parts[0], time2Parts[1]);

    const diff = new Date(date1 - date2);

    const hours = diff.getUTCHours();
    const minutes = diff.getUTCMinutes();

    return `${('0' + hours).slice(-2)}:${('0' + minutes).slice(-2)}`;
}

function multiplyTime(time, rate) {
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10) / 60;

    return (hours + minutes) * rate;
}

function formatarParaNumero(valor) {
    const numero = parseFloat(valor);
    return isNaN(numero) ? 0 : numero; // Retorna 0 se não for um número válido
}

function formatCurrencyToFloat(currencyStr) {
    // Remove o símbolo de moeda e espaços em branco
    let numberStr = currencyStr.replace(/[^\d,.-]/g, '');

    // Substitui a vírgula decimal por um ponto
    numberStr = numberStr.replace('.', '').replace(',', '.');

    // Converte a string para um número de ponto flutuante
    let numberFloat = parseFloat(numberStr);

    return numberFloat;
}


function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}