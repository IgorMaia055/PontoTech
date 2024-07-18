function conferirConnection() {
    isOnline().then((online) => {
        if (online) {
            sincronizar();
        }
    });
}

conferirConnection();
setInterval(() => {
    conferirConnection();
}, 4000);

async function sincronizar() {
    try {
        await goUploadBatePonto();
        await goUploadRegistros();
    } catch (erro) {
        console.error(erro);
    }
}

async function goUploadBatePonto() {
    getBatePonto().then(data => {
        let batePontos = JSON.parse(data);
        if (batePontos.length > 0) {
            let hasPendingUploads = false;
            console.log(batePontos)
            for (const batePonto of batePontos[0].values) {
                if (batePonto[12] == 0) { // Verifica se o upload ainda não foi feito
                    hasPendingUploads = true;

                    document.getElementById('avisoBackup').hidden = false;
                    document.getElementById('nav').hidden = true;

                    let dados = {
                        id_colaborador: batePonto[1],
                        id_projeto: batePonto[2],
                        tipo: batePonto[3],
                        date: batePonto[4],
                        mes: batePonto[5],
                        ano: batePonto[6],
                        id_unic: batePonto[11]
                    };

                    setBatePontoSistem(dados).then(() => {
                        updateBatePontoUpload(batePonto[11], 1).then(async() => {
                            console.log("UPLOAD FEITO");

                            // location.reload();
                        }).catch(error => {
                            console.error(error);
                        });
                    }).catch(error => {
                        console.error(error);
                    });
                }
            }
            if (!hasPendingUploads) {
                document.getElementById('avisoBackup').hidden = true;
                document.getElementById('nav').hidden = false;
            }
        } else {
            document.getElementById('avisoBackup').hidden = true;
            document.getElementById('nav').hidden = false;
        }
    }).catch(error => {
        console.error(error);
    });
}

async function goUploadRegistros() {
    try {
        getRegistros().then(data => {
            let registros = JSON.parse(data);
            if (registros.length > 0) {
                let hasPendingUploads = false;
                console.log(registros)
                for (const registro of registros[0].values) {
                    if (registro[7] == 0) { // Verifica se o upload ainda não foi feito
                        hasPendingUploads = true;

                        document.getElementById('avisoBackup').hidden = false;
                        document.getElementById('nav').hidden = true;

                        getBatePonto().then(data => {
                            let batePontos = JSON.parse(data);

                            if (batePontos.length > 0) {
                                for (const batePonto of batePontos[0].values) {
                                    if (batePonto[0] == registro[1]) {
                                        getUsers().then(data => {
                                            let user = JSON.parse(data);
                                            let arr = {
                                                id_unic: batePonto[11],
                                                id_colaborador: user[0].values[0][1],
                                                periodo: registro[2],
                                                time: registro[3],
                                                imagem: registro[4],
                                                latitude: registro[5],
                                                longitude: registro[6],
                                                km_transporte: (batePonto[7] == null ? '' : batePonto[7]),
                                                diaria: (batePonto[8] == null ? '' : batePonto[8]),
                                                custo_transporte: (batePonto[9] == null ? '' : batePonto[9]),
                                                atividade: (batePonto[10] == null ? '' : batePonto[10])
                                            };

                                            insertDbOnlineRegister(arr).then(() => {
                                                console.log('Inserido no db online');

                                                if (registro[2] != 'saida') {
                                                    updateRegistros(batePonto[0], registro[2], 1).then(() => {
                                                        console.log('UPDATE FEITO.');
                                                        // location.reload();
                                                    }).catch(error => {
                                                        console.error(error);
                                                    });
                                                } else {
                                                    deleteBatePonto(batePonto[0]).then(() => {
                                                        console.log('BatePonto deletado');
                                                        deleteRegistro(batePonto[0]).then(() => {
                                                            console.log('Registros deletados');
                                                            // location.reload();
                                                        }).catch(error => {
                                                            console.error(error);
                                                        });
                                                    }).catch(error => {
                                                        console.error(error);
                                                    });
                                                }

                                            }).catch(error => {
                                                console.error(error);
                                            });

                                        }).catch(error => {
                                            console.error(error);
                                        });
                                    }
                                }
                            }
                        }).catch(error => {
                            console.error(error);
                        });

                    }
                }
                if (!hasPendingUploads) {
                    document.getElementById('avisoBackup').hidden = true;
                    document.getElementById('nav').hidden = false;
                }
            } else {
                document.getElementById('avisoBackup').hidden = true;
                document.getElementById('nav').hidden = false;
            }
        }).catch(error => {
            console.error(error);
        });
    } catch (erro) {
        console.error(erro);
    }
}

async function insertDbOnlineRegister(dados) {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/insertRegistro/';

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
            console.log('Inserido com sucesso no db online');
        } else {
            console.log(responseData);
        }

    } catch (error) {
        console.error('Erro:', error);
    }
}

async function setBatePontoSistem(dados) {
    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/insertBatePonto/';

        const data = {
            id_colaborador: dados.id_colaborador,
            date: dados.date,
            id_projeto: dados.id_projeto,
            mes: dados.mes,
            tipo: dados.tipo,
            ano: dados.ano,
            id_unic: dados.id_unic
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        const responseData = await response.json();

        if (responseData.status !== 'erro') {
            console.log('Inserido no db online');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}