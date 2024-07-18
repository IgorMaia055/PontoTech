isOnline().then((online) => {
    if (online) {
        getDbOnlineCliente();
    }
});

async function getDbOnlineCliente() {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/clientes/';

        const response = await fetch(apiUrl, {
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
            const dados = JSON.parse(data.clientes);

            await deleteAllClientes()

            for (const dado of dados) {
                await setClientes(dado.id, dado.nome, dado.municipio);
                //console.log("Cliente inserido:", dado.id);
            }

            setTimeout(async() => {
                const clientesAtualizados = JSON.parse(await getClientes());
                //console.log(clientesAtualizados[0].values);
            }, 500);

        } else {
            //console.log('Erro na resposta da API:', data);
        }
    } catch (error) {
        //console.error('Erro:', error);
    }
}