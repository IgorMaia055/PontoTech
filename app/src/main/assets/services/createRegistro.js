setTimeout(() => {
    getUsers().then(data => {
        let user = JSON.parse(data);

        getBatePonto(user[0].values[0][1]).then(data => {
            let batePontos = JSON.parse(data);

            for (const batePonto of batePontos[0].values) {

                document.getElementById('spinner').hidden = true

                document.getElementById(`salvar${batePonto[0]}`).addEventListener('click', goRegistro);
                document.getElementById(`save${batePonto[0]}`).addEventListener('click', () => {
                    if (document.getElementById('atividade' + batePonto[0]).value !== '') {
                        goRegistro();
                    } else {
                        document.getElementById('atividade' + batePonto[0]).classList.add('is-invalid');
                    }
                });

                async function goRegistro() {

                    document.getElementById('cameraNewRegistro' + batePonto[0]).disabled = true

                    document.getElementById('cancelar' + batePonto[0]).disabled = true
                    document.getElementById('cancel' + batePonto[0]).disabled = true

                    document.getElementById(`salvar${batePonto[0]}`).innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
                    document.getElementById(`salvar${batePonto[0]}`).disabled = true;
                    document.getElementById(`save${batePonto[0]}`).innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
                    document.getElementById(`save${batePonto[0]}`).disabled = true;

                    let periodo = document.getElementById(`selectPeriodo${batePonto[0]}`).value;
                    let element = document.querySelector(`#fotoCanvas${batePonto[0]}`);
                    let base64 = element ? element.toDataURL() : '';
                    let id_unic = batePonto[11];

                    if (navigator.geolocation) {
                        log("Obtendo a localização");
                        navigator.geolocation.getCurrentPosition(function (position) {
                            let latitude = position.coords.latitude;
                            let longitude = position.coords.longitude;

                            log("Localização obtida");

                            let now = new Date();
                            let hours = now.getHours();
                            let minutes = now.getMinutes();
                            let time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                            createTheRegister(batePonto, periodo, time, base64, latitude, longitude)

                            if (periodo == 'intervalo' && user[0].values[0][11] == 1) {
                                let timeRetorno = somaTempos(time, '01:00')

                                createTheRegister(batePonto, 'retorno', timeRetorno, base64, latitude, longitude)
                            }


                        }, function (error) {
                            log('Erro ao obter a localização: ' + error);
                            alert('Erro ao obter a localização! Tente novamente.');
                            console.error(error);
                            location.reload()
                        }, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        });
                    } else {
                        log("Geolocalização não é suportada.");
                        alert('Geolocalização não é suportada.');
                        document.getElementById(`salvar${batePonto[0]}`).innerHTML = 'Salvar';
                        document.getElementById(`salvar${batePonto[0]}`).disabled = false;
                    }
                }
            }
        }).catch(erro => {
            log('Erro ao obter bate ponto: ' + erro);
            console.error(erro);
        });
    }).catch(erro => {
        log('Erro ao obter usuários: ' + erro);
        console.error(erro);
    });
}, 1000);

async function createTheRegister(batePonto, periodo, time, base64, latitude, longitude) {
    setRegistros(batePonto[0], periodo, time, base64, latitude, longitude, 0)
        .then(() => {
            log('Inserção do registro local feita com sucesso.');

            let km_transporte = document.getElementById('km_transporte' + batePonto[0]).value;
            let diaria = document.getElementById('valor_diaria' + batePonto[0]).value;
            let custo_transporte = document.getElementById('custo_transporte' + batePonto[0]).value;
            let atividade = document.getElementById('atividade' + batePonto[0]).value;

            if (periodo === 'saida') {
                updateBatePonto(km_transporte, diaria, custo_transporte, atividade, batePonto[0])
                    .then(() => {

                        executarSincronizacaoEfect(batePonto[0], time)

                    }).catch(erro => {
                        log('Erro ao tentar atualizar o bateponto: ' + erro);
                        alert('Erro ao tentar atualizar o registro! Tente novamente.');
                        console.error(erro);
                        location.reload()
                    });
            } else {
                executarSincronizacaoERecarga(batePonto[0])
            }

        }).catch(error => {
            log('Erro ao tentar inserir o registro local: ' + error);
            alert('Erro ao tentar inserir o registro local! Tente novamente.');
            console.error(error);
            location.reload()
        });
}


async function executarSincronizacaoERecarga(id) {
    try {
        clearInterval(interval)

        await conferirConnectionSincronizar(false);

        document.getElementById('salvar' + id).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
</svg>`
        document.getElementById('salvarComplete' + id).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
</svg>`

        setTimeout(() => {
            location.reload()
        }, 500);

    } catch (error) {
        console.log('Erro durante a sincronização:', error);
    }
}

async function executarSincronizacaoEfect(id, time) {
    try {
        clearInterval(interval)

        await conferirConnectionSincronizar(false);

        document.getElementById('saida' + id).innerHTML = time

        document.getElementById('salvar' + id).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
</svg>`
        document.getElementById('salvarComplete' + id).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
</svg>`

        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            $(modal).modal('hide');
        });

        document.getElementById('cardBatePonto' + id).style.animation = 'destruirAnimacao 1s forwards'

        setTimeout(() => {

            interval = setInterval(() => {
                conferirConnectionSincronizar(true);
            }, 5000);

            document.getElementById('colBatePonto' + id).remove()
        }, 1000);

    } catch (error) {
        console.log('Erro durante a sincronização:', error);
    }
}



function somaTempos(tempo1, tempo2) {
    // Divide os tempos em horas e minutos
    const [hora1, min1] = tempo1.split(':').map(Number);
    const [hora2, min2] = tempo2.split(':').map(Number);

    // Soma os minutos e as horas separadamente
    let somaMinutos = min1 + min2;
    let somaHoras = hora1 + hora2;

    // Se os minutos somados forem 60 ou mais, ajusta as horas
    if (somaMinutos >= 60) {
        somaHoras += Math.floor(somaMinutos / 60);
        somaMinutos = somaMinutos % 60;
    }

    // Formata as horas e minutos para sempre ter dois dígitos
    const horasFormatadas = String(somaHoras).padStart(2, '0');
    const minutosFormatados = String(somaMinutos).padStart(2, '0');

    // Retorna o resultado no formato "HH:mm"
    return `${horasFormatadas}:${minutosFormatados}`;
}