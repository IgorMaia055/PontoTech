setTimeout(() => {
    getBatePonto().then(data => {
        let batePontos = JSON.parse(data);

        for (const batePonto of batePontos[0].values) {
            document.getElementById(`salvar${batePonto[0]}`).addEventListener('click', goRegistro);
            document.getElementById(`save${batePonto[0]}`).addEventListener('click', () => {
                if (document.getElementById('atividade' + batePonto[0]).value != '') {
                    goRegistro();
                } else {
                    document.getElementById('atividade' + batePonto[0]).classList.add('is-invalid');
                }
            });

            async function goRegistro() {
                document.getElementById(`salvar${batePonto[0]}`).innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
                document.getElementById(`salvar${batePonto[0]}`).disabled = true;
                document.getElementById(`save${batePonto[0]}`).innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
                document.getElementById(`save${batePonto[0]}`).disabled = true;

                let periodo = document.getElementById(`selectPeriodo${batePonto[0]}`).value;
                let element = document.querySelector(`#fotoCanvas${batePonto[0]}`);
                let base64 = element ? element.toDataURL() : '';
                let id_unic = batePonto[11];

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async function(position) {
                        let latitude = position.coords.latitude;
                        let longitude = position.coords.longitude;

                        let now = new Date();
                        let hours = now.getHours();
                        let minutes = now.getMinutes();
                        let time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                        try {

                            setRegistros(batePonto[0], periodo, time, base64, latitude, longitude, 0).then(() => {
                                console.log('Inserção do registro local feita com sucesso.');

                                let km_transporte = '';
                                let diaria = '';
                                let custo_transporte = '';
                                let atividade = '';

                                getUsers().then(data => {
                                    user = JSON.parse(data);
                                    isOnline().then((online) => {
                                        km_transporte = document.getElementById('km_transporte' + batePonto[0]).value;
                                        diaria = document.getElementById('valor_diaria' + batePonto[0]).value;
                                        custo_transporte = document.getElementById('custo_transporte' + batePonto[0]).value;
                                        atividade = document.getElementById('atividade' + batePonto[0]).value;

                                        if (online) {
                                            let arr = {
                                                id_unic: id_unic,
                                                id_colaborador: user[0].values[0][1],
                                                periodo: periodo,
                                                time: time,
                                                imagem: base64,
                                                latitude: latitude,
                                                longitude: longitude,
                                                km_transporte: km_transporte,
                                                diaria: diaria,
                                                custo_transporte: custo_transporte,
                                                atividade: atividade
                                            };

                                            insertDbOnlineRegister(arr).then(() => {
                                                console.log('INsert db Online')

                                                if (periodo == 'saida') {

                                                    deleteRegistro(batePonto[0]).then(() => {
                                                        console.log('registros deletados');
                                                    }).catch(erro => {
                                                        console.error(erro);
                                                    })

                                                    deleteBatePonto(batePonto[0]).then(() => {
                                                        console.log('bateponto deleta')
                                                    }).catch(erro => {
                                                        console.error(erro);
                                                    })

                                                } else {
                                                    updateRegistros(batePonto[0], periodo, 1).then(() => {
                                                        console.log('UPDATE FEITO.')
                                                    }).catch(error => {
                                                        console.error(error);
                                                    })
                                                }

                                            }).catch(erro => {
                                                console.error(erro);
                                            })
                                        } else {
                                            location.reload();
                                        }
                                    });

                                }).catch(erro => {
                                    console.error(erro);
                                })

                            }).catch(error => {
                                console.error('Erro ao inserir. Tente novamente!')
                                location.reload()
                            })

                        } catch (error) {
                            console.error('Erro ao inserir o registro. Tente novamente!');
                            location.reload()
                        }
                    }, function(error) {
                        alert('Erro ao obter localização. Tente novamente!');
                        location.reload()
                    }, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                } else {
                    alert('Geolocalização não é suportada.');
                    document.getElementById(`salvar${batePonto[0]}`).innerHTML = 'Salvar';
                    document.getElementById(`salvar${batePonto[0]}`).disabled = false;
                }
            }
        }
    });
}, 650);

async function insertDbOnlineRegister(dados) {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/insertRegistro/';

        // Verificando se todos os dados necessários estão presentes
        if (!dados.id_unic || !dados.id_colaborador || !dados.periodo || !dados.time || !dados.imagem || !dados.latitude || !dados.longitude) {
            throw new Error('Dados incompletos: ' + JSON.stringify(dados));
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error('Erro na requisição: ' + response.statusText + ' - ' + errorText);
        }

        const responseData = await response.json();
        console.log(responseData);

        if (responseData.status !== 'erro') {
            location.reload();
        } else {
            console.log(responseData);
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}