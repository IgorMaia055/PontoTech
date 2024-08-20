isOnline().then((online) => {
    if (online) {
        getDbOnlineCliente();
    }
});

async function getDbOnlineCliente() {
    log('Tentado buscar os clientes do DbOnline')

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
                log('Cliente inserido')
            }

        } else {
            log('Erro ao listar os clientes')
            console.log('erro')
        }
    } catch (error) {
        log('Erro ao buscar os clientes')

        console.log('erro')
    }
}