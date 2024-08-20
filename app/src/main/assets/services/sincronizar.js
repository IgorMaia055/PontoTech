async function conferirConnectionSincronizar(sinc) {
    return new Promise((resolve, reject) => {
        isOnline().then(async (online) => {
            if (online) {
                try {
                    await sincronizar(sinc);
                    resolve(); // Resolve a Promise quando a sincronização é concluída
                } catch (error) {
                    reject('Erro ao sincronizar: ' + error); // Rejeita a Promise em caso de erro
                }
            } else {
                resolve(); // Resolve a Promise se não estiver online
            }
        }).catch(error => {
            console.error('Erro ao verificar conexão:', error);
            reject('Erro ao verificar conexão: ' + error); // Rejeita a Promise se houver erro na verificação
        });
    });
}

let interval = setInterval(() => {
    conferirConnectionSincronizar(true);
}, 5000);

async function sincronizar(sinc) {
    try {

        await goUploadBatePonto(sinc);
        await goUploadRegistros(sinc);

        if (sinc) {
            document.getElementById('avisoBackup').hidden = true
            document.getElementById('nav').hidden = false
        }

    } catch (erro) {
        console.error('Erro ao tentar sincronizar:', erro);
        alert('Erro ao tentar sincronizar! Tente novamente.');
    }
}

async function goUploadBatePonto(sinc) {
    try {
        const userData = await getUsers();
        let user = JSON.parse(userData);

        if (user.length > 0) {
            const batePontoData = await getBatePonto(user[0].values[0][1]);
            let batePontos = JSON.parse(batePontoData);

            if (batePontos.length > 0) {
                // Cria uma array de promessas
                const uploadPromises = batePontos[0].values
                    .filter(batePonto => batePonto[12] == 0) // Filtra apenas aqueles que ainda não foram sincronizados
                    .map(batePonto => {
                        if (sinc) {
                            document.getElementById('avisoBackup').hidden = false
                            document.getElementById('nav').hidden = true
                        }

                        let dados = {
                            id_colaborador: batePonto[1],
                            id_projeto: batePonto[2],
                            tipo: batePonto[3],
                            date: batePonto[4],
                            mes: batePonto[5],
                            ano: batePonto[6],
                            id_unic: batePonto[11]
                        };

                        return setBatePontoSistem(dados)
                            .then(() => {
                                log('Inserção realizada');
                                log('Fazendo update no upload para 1');
                                return updateBatePontoUpload(batePonto[11], 1)
                                    .then(() => log('Upload atualizada para 1'))
                                    .catch(error => {
                                        log('Erro ao atualizar');
                                        console.error(error);
                                    });
                            })
                            .catch(error => {
                                log('Erro ao inserir batePonto no dbOnline');
                                console.error(error);
                            });
                    });

                // Espera todas as promessas serem resolvidas
                await Promise.all(uploadPromises);
            }
        }
    } catch (error) {
        log('Erro ao selecionar os batePontos');
        console.error(error);
    }
}

async function goUploadRegistros(sinc) {
    try {
        const registrosData = await getRegistros();
        let registros = JSON.parse(registrosData);
        if (registros.length > 0) {
            const registroPromises = registros[0].values
                .filter(registro => registro[7] == 0) // Filtra apenas aqueles que ainda não foram sincronizados
                .map(async registro => {

                    if (sinc) {
                        document.getElementById('avisoBackup').hidden = false
                        document.getElementById('nav').hidden = true
                    }

                    log('BatePonto com upload == 0 encontrados');

                    const userData = await getUsers();
                    let user = JSON.parse(userData);

                    if (user.length > 0) {
                        const batePontoData = await getBatePonto(user[0].values[0][1]);
                        let batePontos = JSON.parse(batePontoData);

                        if (batePontos.length > 0) {
                            for (const batePonto of batePontos[0].values) {
                                if (batePonto[0] == registro[1]) {
                                    const arr = {
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

                                    log('Inserindo o registro no dbOnline');
                                    try {
                                        await insertDbOnlineRegister(arr);
                                        log('Registro inserido no dbOnline');

                                        if (registro[2] != 'saida') {
                                            log('Periodo != saida, tentando fazer update do upload para 1');
                                            await updateRegistros(batePonto[0], registro[2], 1);
                                            log('Update realizado');
                                        } else {
                                            log('Periodo == saida, tentando apagar o batePonto local');
                                            await deleteBatePonto(batePonto[0]);
                                            log('BatePonto deletado');
                                            log('Tentando deletar os registros locais');
                                            await deleteRegistro(batePonto[0]);
                                            log('Registros deletados');
                                        }
                                    } catch (error) {
                                        log('Erro ao tentar iserir no dbOnline');
                                        console.error(error);
                                    }
                                }
                            }
                        }
                    }
                });

            await Promise.all(registroPromises);
        }
    } catch (error) {
        log('Erro ao tentar buscar os registros locais');
        console.error(error);
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

        const responseData = await response.json();

        if (responseData.status !== 'erro' && response.ok) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error('Erro ao inserir registro online:', error);
        throw error; // Adicionando o rethrow para capturar no `sincronizar`
    }
}

async function setBatePontoSistem(dados) {

    try {
        const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/insertBatePonto/';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const responseData = await response.json();
        if (responseData.status !== 'erro' && response.ok) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        log('Erro ao inserir no dbOnline');
        console.error('Erro:', error);
        throw error; // Adicionando o rethrow para capturar no `goUploadBatePonto`
    }
}
