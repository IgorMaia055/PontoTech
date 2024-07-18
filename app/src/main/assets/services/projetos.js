isOnline().then((online) => {
    if (online) {
        getDbOnlineProjetos();
    }
});

async function getDbOnlineProjetos() {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/projetos/';
        const user = await getUsers();
        const dadosUser = JSON.parse(user);

        const params = new URLSearchParams({
            id_colaborador: dadosUser[0].values[0][1]
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
            const dadosApi = JSON.parse(data.projetos);

            await deleteAllProjetos()
            for (const dado of dadosApi) {
                await setProjetos(dado.id, dado.nome, dado.area, dado.descricao, dado.local, dado.id_cliente);
                //console.log("Projeto inserido:", dado.id);
            }

        } else {
            //console.log('Erro na resposta da API:', data);
        }
    } catch (error) {
        //console.error('Erro:', error);
    }
}