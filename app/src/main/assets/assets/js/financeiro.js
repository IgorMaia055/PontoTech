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

        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/buscaInfoTableFinanceiro/';
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

            const batePontos = JSON.parse(data.bateponto);
            const projetos = JSON.parse(data.projetos);
            const clientes = JSON.parse(data.clientes);

            if (batePontos.length > 0) {
                for (const batePonto of batePontos) {
                    const projeto = projetos.find(p => p.id == batePonto.id_projeto);
                    const cliente = clientes.find(c => c.id == projeto.id_cliente);

                    document.getElementById('avisoBatePonto').hidden = true;

                    document.getElementById('body').innerHTML += `
                        <tr class="bodyTable">
                            <td>${batePonto.tipo}</td>
                            <td>${cliente ? cliente.nome : ''}</td>
                            <td>${projeto ? projeto.local : ''}</td>
                            <td>${projeto ? projeto.area : ''}</td>
                            <td>${projeto ? projeto.nome : ''}</td>
                            <td>${formatDate(batePonto.date)}</td>
                            <td style="font-weight: 600;">${getDayOfWeek(batePonto.date)}</td>
                            <td id="entrada${batePonto.id}">--:--</td>
                            <td id="saida${batePonto.id}">--:--</td>
                            <td id="intervalo${batePonto.id}" style="color: red;">--:--</td>
                            <td id="horas${batePonto.id}">--:--</td>
                            <td><input type="number" style="width: 4rem;" id="horas_extras${batePonto.id}" onchange="saveHoraExtras(${batePonto.id}, ${(batePonto.diaria ? batePonto.diaria : 0)}, ${(batePonto.km_transporte ? batePonto.km_transporte : 0)}, ${(batePonto.custo_transporte ? batePonto.custo_transporte : 0)}, '${(batePonto.tipo ? batePonto.tipo : 0)}')" value="${batePonto.horas_extras}">%</td>
                            <td>${(batePonto.diaria == null || batePonto.diaria == 0 ? 'R$ --' : Number(batePonto.diaria).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))}</td>
                            <td id="valor_transporte${batePonto.id}">R$ --</td>
                            <td id="total${batePonto.id}">R$ --</td>
                        </tr>`;

                    await getRegistrosIdBatePonto(batePonto.id, batePonto.diaria, batePonto.km_transporte, batePonto.custo_transporte, batePonto.tipo, batePonto.horas_extras);
                }

                calculaTableFechamento(totalGeral)
            } else {
                document.getElementById('avisoBatePonto').innerHTML = 'Nenhum registro encontrado.';
                document.getElementById('fechamentoElement').hidden = true;
            }
        } else {
            console.log('Erro na resposta da API:', data);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function getRegistrosIdBatePonto(id_bateponto, diaria, km_transporte, custo_transporte, tipo, porcentHoraExtra) {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/getRegistrosIdBatePonto/';
        const params = new URLSearchParams({ id_bateponto }).toString();

        const response = await fetch(`${apiUrl}?${params}`);
        if (!response.ok) throw new Error('Erro na requisição: ' + response.statusText);

        const data = await response.json();

        if (data.status !== 'erro') {
            const registros = JSON.parse(data.registros);
            let entrada = '--:--',
                saida = '--:--',
                intervaloTime, retorno, totalHoras = '';

            for (const registro of registros) {
                if (registro.periodo === 'entrada') entrada = registro.time || entrada;
                else if (registro.periodo === 'saida') saida = registro.time || saida;
                else if (registro.periodo === 'intervalo') intervaloTime = registro.time;
                else if (registro.periodo === 'retorno') retorno = registro.time;
            }

            document.getElementById('entrada' + id_bateponto).innerHTML = entrada;
            document.getElementById('saida' + id_bateponto).innerHTML = saida;

            if (entrada !== '--:--' && saida !== '--:--') {
                if (intervaloTime && retorno) {
                    const intervaloFinal = subtractTime(retorno, intervaloTime);
                    document.getElementById('intervalo' + id_bateponto).innerHTML = intervaloFinal;
                    totalHoras = subtractTime(subtractTime(saida, entrada), intervaloFinal);
                } else {
                    totalHoras = subtractTime(saida, entrada);
                }
                document.getElementById('horas' + id_bateponto).innerHTML = totalHoras;
            }

            let valorTransporte = 0;
            if (km_transporte) valorTransporte += Number(km_transporte) * Number(data.valor_km);
            if (custo_transporte) valorTransporte += Number(custo_transporte);

            document.getElementById('valor_transporte' + id_bateponto).innerHTML = formatarParaNumero(valorTransporte).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ --';

            const user = JSON.parse(await getUsers());
            let valorHoras = tipo === 'viagem' ? multiplyTime(totalHoras, Number(user[0].values[0][9])) : multiplyTime(totalHoras, Number(user[0].values[0][8]));

            if (porcentHoraExtra) valorHoras *= (porcentHoraExtra / 100) + 1;

            const total = valorHoras + (diaria ? Number(diaria) : 0) + formatarParaNumero(valorTransporte);
            document.getElementById('total' + id_bateponto).innerHTML = formatarParaNumero(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            totalGeral += formatarParaNumero(total);
        } else {
            console.log('Erro na resposta da API:', data);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function saveHoraExtras(id_bateponto, diaria, km_transporte, custo_transporte, tipo) {
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

        let newTotalGeral = totalGeral - Number(parseCurrency(document.getElementById('total' + id_bateponto).innerHTML))

        totalGeral = 0

        await getRegistrosIdBatePonto(id_bateponto, diaria, km_transporte, custo_transporte, tipo, horasExtras);

        totalGeral += newTotalGeral
        calculaTableFechamento(totalGeral)

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
            id_colaborador: dadosUser[0].values[0][1], // ID do colaborador
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
                fgts = fechamento_hora.fgts ? formatarParaNumero(fechamento_hora.fgts) : 0;
                inss = fechamento_hora.inss ? formatarParaNumero(fechamento_hora.inss) : 0;
                irrf = fechamento_hora.irrf ? formatarParaNumero(fechamento_hora.irrf) : 0;
                convenio = fechamento_hora.convenio ? formatarParaNumero(fechamento_hora.convenio) : 0;
                outros_descontos = fechamento_hora.outros_descontos ? formatarParaNumero(fechamento_hora.outros_descontos) : 0;
                adiantamento = fechamento_hora.adiantamento ? formatarParaNumero(fechamento_hora.adiantamento) : 0;
                valor_nf = fechamento_hora.valor_nf ? formatarParaNumero(fechamento_hora.valor_nf) : 0;

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

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}