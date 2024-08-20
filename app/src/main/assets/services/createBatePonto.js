async function createBatePonto() {
    try {

        document.getElementById('btnCancelBatePonto').disabled = true
        document.getElementById('btnCriar').disabled = true
        document.getElementById('btnCriar').innerHTML = `<div class="spinner-border text-light" role="status">
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

        log('tentando inserir o batePonto local')

        setBatePonto(id_colaborador, id_projeto, tipo, date, month, year, null, null, null, '', unic_id, 0).then(() => {

            executarSincronizacaoERecargaBatePonto()

        }).catch(erro => {
            log('Erro ao tentar inserir')
            alert('Algo deu errado! tente novamente.')
            console.log('erro')
            console.error(erro);

            location.reload()
        })
    } catch (erro) {
        log('Erro ao tentar inserir')
        alert('Algo deu errado! tente novamente.')
        console.log('erro')
        console.error(erro);

        location.reload()
    }
}

function generateUniqueId() {
    let timestamp = Date.now();
    let random = Math.floor(Math.random() * 10000);

    return `${timestamp}-${random}`;
}

async function executarSincronizacaoERecargaBatePonto() {
    try {
        clearInterval(interval)

        await conferirConnectionSincronizar(false);

        document.getElementById('btnCriar').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
</svg>`

        setTimeout(() => {
            location.reload()
        }, 500);

    } catch (error) {
        console.log('Erro durante a sincronização:', error);
    }
}