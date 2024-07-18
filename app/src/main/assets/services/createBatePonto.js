async function createBatePonto() {
    try {

        document.getElementById('btnCriar').disabled = true
        document.getElementById('btnCriar').innerHTML = `<div class="spinner-border text-danger" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`

        let tipo = document.getElementById('tipo').value;
        let id_projeto = document.getElementById('id_projeto').value;

        const data = await getUsers();
        let user = JSON.parse(data);
        let id_colaborador = user[0].values[0][1];

        let currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let day = String(currentDate.getDate()).padStart(2, '0');

        let date = `${year}-${month}-${day}`;
        let unic_id = generateUniqueId();

        setBatePonto(id_colaborador, id_projeto, tipo, date, month, year, null, null, null, '', unic_id, 0).then(() => {
            console.log("Inserção do BatePonto concluída");

            isOnline().then((online) => {
                if (online) {
                    // Conectado
                    let dados = {
                        id_colaborador: id_colaborador,
                        id_projeto: id_projeto,
                        tipo: tipo,
                        date: date,
                        mes: month,
                        ano: year,
                        id_unic: unic_id
                    };

                    setBatePontoSistem(dados).then(() => {
                        updateBatePontoUpload(unic_id, 1).then(() => {
                            console.log("UPLOAD FEITO");
                            location.reload()
                        }).catch(error => {
                            console.error(error);
                        })
                    }).catch(error => {
                        console.error(error);
                    })
                } else {
                    location.reload();
                }
            });

        }).catch(erro => {
            console.error(erro);
        })
    } catch (erro) {
        console.error(erro);
    }
}

async function setBatePontoSistem(dados) {
    try {
        // URL da API para onde a requisição será enviada
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/insertBatePonto/';

        // Dados a serem enviados
        const data = {
            id_colaborador: dados.id_colaborador,
            date: dados.date,
            id_projeto: dados.id_projeto,
            mes: dados.mes,
            tipo: dados.tipo,
            ano: dados.ano,
            id_unic: dados.id_unic
        };

        // Envio da requisição POST
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Verificação da resposta da API
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        // Conversão da resposta para JSON
        const responseData = await response.json();

        if (responseData.status != 'erro') {

            console.log(responseData)
                // location.reload()
        }
    } catch (error) {
        // Tratamento de erros
        console.error('Erro:', error);
    }
}

function generateUniqueId() {
    let timestamp = Date.now();
    let random = Math.floor(Math.random() * 10000);

    return `${timestamp}-${random}`;
}