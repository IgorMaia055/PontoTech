setTimeout(() => {
    getUsers().then(data => {

        let user = JSON.parse(data)

        if (user.length > 0) {

            getBatePontoDesc(user[0].values[0][1]).then(data => {
                let batePontos = JSON.parse(data)

                if (batePontos.length > 0) {
                    for (const batePonto of batePontos[0].values) {

                        buscaRegistro(batePonto[0], 'saida').then(data => {


                            let batePontoSaida = JSON.parse(data)
                            if (!batePontoSaida.length > 0) {
                                getProjetos().then(dataProjetos => {
                                    let projetos = JSON.parse(dataProjetos)

                                    for (const projeto of projetos[0].values) {
                                        if (projeto[1] == batePonto[2]) {

                                            getClientes().then(dataCliente => {
                                                let clientes = JSON.parse(dataCliente)

                                                for (const cliente of clientes[0].values) {
                                                    if (cliente[1] == projeto[6]) {

                                                        getRegistros().then(dataGetRegistros => {
                                                            let registros = JSON.parse(dataGetRegistros)

                                                            console.log(registros.length)
                                                            if (registros.length > 0) {
                                                                let entrada = '--:--'
                                                                let intervalo = '--:--'
                                                                let retorno = '--:--'
                                                                let saida = '--:--'

                                                                let selectOpt

                                                                for (const registro of registros[0].values) {
                                                                    if (registro[1] == batePonto[0]) {
                                                                        if (registro[2] == 'entrada') {
                                                                            entrada = (registro[3])

                                                                            selectOpt = ` <select id="selectPeriodo${batePonto[0]}" class="form-select border-4">
                                                                    <option value="entrada" disabled>Entrada</option>
                                                                    <option value="intervalo">Intervalo</option>
                                                                    <option value="retorno" disabled>Retorno</option>
                                                                    <option value="saida">Saída</option>
                                                                </select>`
                                                                        }
                                                                        if (registro[2] == 'intervalo') {
                                                                            intervalo = (registro[3])

                                                                            selectOpt = ` <select id="selectPeriodo${batePonto[0]}" class="form-select border-4">
                                                                    <option value="entrada" disabled>Entrada</option>
                                                                    <option value="intervalo" disabled>Intervalo</option>
                                                                    <option value="retorno">Retorno</option>
                                                                    <option value="saida" disabled>Saída</option>
                                                                </select>`
                                                                        }
                                                                        if (registro[2] == 'retorno') {
                                                                            retorno = (registro[3])

                                                                            selectOpt = ` <select id="selectPeriodo${batePonto[0]}" class="form-select border-4">
                                                                    <option value="entrada" disabled>Entrada</option>
                                                                    <option value="intervalo" disabled>Intervalo</option>
                                                                    <option value="retorno" disabled>Retorno</option>
                                                                    <option value="saida">Saída</option>
                                                                </select>`
                                                                        }
                                                                        if (registro[2] == 'saida') {
                                                                            saida = (registro[3])
                                                                        }
                                                                    }
                                                                }

                                                                insertDomElments(batePonto, projeto, cliente, entrada, intervalo, retorno, saida, selectOpt)
                                                                document.getElementById('spinner').hidden = true
                                                            } else {
                                                                let str = `<select id="selectPeriodo${batePonto[0]}" class="form-select border-4">
                                                                    <option value="entrada">Entrada</option>
                                                                    <option value="intervalo" disabled>Intervalo</option>
                                                                    <option value="retorno" disabled>Retorno</option>
                                                                    <option value="saida" disabled>Saída</option>
                                                                </select>`

                                                                insertDomElments(batePonto, projeto, cliente, '--:--', '--:--', '--:--', '--:--', str)
                                                                document.getElementById('spinner').hidden = true
                                                            }

                                                        }).catch(erro => {
                                                            document.getElementById('spinner').hidden = true
                                                            console.log(erro)
                                                        })

                                                    }
                                                }
                                            })

                                        }
                                    }
                                })
                            }
                        }).catch(erro => {
                            document.getElementById('spinner').hidden = true
                            console.error(erro);
                        })


                    }
                } else {
                    document.getElementById('spinner').hidden = true
                    document.getElementById('page1Area').innerHTML = 'Nenhum registro encontrado.'
                }

            }).catch(erro => {
                console.log(erro)
            })

            function insertDomElments(batePonto, projeto, cliente, entrada, intervalo, retorno, saida, selectOpt) {

                getUsers().then(data => {
                    let user = JSON.parse(data)


                    if (selectOpt == undefined) {
                        selectOpt = `<select id="selectPeriodo${batePonto[0]}" class="form-select border-4">
                                                                <option value="entrada">Entrada</option>
                                                                <option value="intervalo" disabled>Intervalo</option>
                                                                <option value="retorno" disabled>Retorno</option>
                                                                <option value="saida" disabled>Saída</option>
                                                            </select>`
                    }

                    let btns = `<button type="button" class="btn btn-danger" id="salvar${batePonto[0]}" disabled>Salvar</button>
            <button type="button" class="btn btn-danger" id="salvarComplete${batePonto[0]}"  data-bs-toggle="modal" data-bs-target="#finalizar${batePonto[0]}" disabled hidden>Continuar</button>`

                    if (retorno != '--:--') {
                        btns = `<button type="button" class="btn btn-danger" id="salvar${batePonto[0]}" disabled hidden>Salvar</button>
            <button type="button" class="btn btn-danger" id="salvarComplete${batePonto[0]}"  data-bs-toggle="modal" data-bs-target="#finalizar${batePonto[0]}" disabled >Continuar</button>`
                    }

                    document.getElementById('spinner').hidden = true

                    document.getElementById('page1Area').innerHTML += `<div class="col-12 mb-4" id="colBatePonto${batePonto[0]}">
        <div class="card p-4 shadow" id="cardBatePonto${batePonto[0]}" style="border-top: 3px solid #E64F1C;">
        <div class="row">
            <div class="col-10">
            <h5>${getDayOfWeek(batePonto[4])}</h5>
            </div>
            <div class="col-2">
                <button type="button" class="btn-invisibled text-dark text-decoration-none btnDeleteBatePontoAndRegisters" data-bs-toggle="modal" data-bs-target="#deletarBatePontoRegistro${batePonto[0]}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
</svg>
                            </button>
            </div>

            <!-- Modal deleteBatePonto -->
        <div class="modal fade" id="deletarBatePontoRegistro${batePonto[0]}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header border-bottom-0">
                        <h1 class="modal-title text-danger fs-5" id="staticBackdropLabel">Você realmente deseja deletar esses registros?</h1>
                    </div>
                    
                    <div class="modal-footer border-top-0">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal" id="btnCancelDeleteBatePonto${batePonto[0]}">Cancelar</button>
                    <button type="button" class="btn btn-outline-danger" id="btnDeleteBatePonto${batePonto[0]}" onclick="deleteRegisterAndBatePonto('${batePonto[11]}', ${batePonto[0]})">Deletar</button>
                    </div>
                </div>
            </div>
        </div>

        </div>
            

            <br>

            <div class="row">
                <div class="col-7">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-calendar2-week me-2" viewBox="0 0 16 16">
                        <path
                            d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                        <path
                            d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5zM11 7.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                    </svg>${formatDate(batePonto[4])}
                </div>
                <div class="col-5 small text-success text-end">
                    ${batePonto[3]}
                </div>
            </div>

            <h6 class="mt-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-clipboard-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M10 1.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5zm-5 0A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5v1A1.5 1.5 0 0 1 9.5 4h-3A1.5 1.5 0 0 1 5 2.5zm-2 0h1v1A2.5 2.5 0 0 0 6.5 5h3A2.5 2.5 0 0 0 12 2.5v-1h1a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2" />
                </svg> ${projeto[4]}
            </h6>

            <p class="mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-buildings-fill" viewBox="0 0 16 16">
                    <path
                        d="M15 .5a.5.5 0 0 0-.724-.447l-8 4A.5.5 0 0 0 6 4.5v3.14L.342 9.526A.5.5 0 0 0 0 10v5.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V14h1v1.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5zM2 11h1v1H2zm2 0h1v1H4zm-1 2v1H2v-1zm1 0h1v1H4zm9-10v1h-1V3zM8 5h1v1H8zm1 2v1H8V7zM8 9h1v1H8zm2 0h1v1h-1zm-1 2v1H8v-1zm1 0h1v1h-1zm3-2v1h-1V9zm-1 2h1v1h-1zm-2-4h1v1h-1zm3 0v1h-1V7zm-2-2v1h-1V5zm1 0h1v1h-1z" />
                </svg> ${cliente[2]} - ${cliente[3]}
            </p>
  

            <div class="row mt-4 p-0">
                <div class="col-3 small text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right text-success" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                    </svg>

                    <div class="text-center mt-1">
                            <span id="entrada">
                                ${entrada}
                            </span>
                    </div>
                </div>
                <div class="col-3 small text-center">

                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left text-danger" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg>

                    <div class="text-center mt-1">
                            <span id="intervalo">
                                ${intervalo}
                            </span>
                    </div>
                </div>
                <div class="col-3 small text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right text-success" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                    </svg>

                    <div class="text-center mt-1">
                            <span id="retorno">
                                ${retorno}
                            </span>
                    </div>
                </div>
                <div class="col-3 small text-center">

                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left text-danger" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg>

                    <div class="text-center mt-1">
                            <span id="saida${batePonto[0]}">
                                ${saida}
                            </span>
                    </div>
                </div>
            </div>

                <div class="text-center mt-4">
                <button type="button" class="btn btn-danger" id="cameraNewRegistro${batePonto[0]}" data-bs-toggle="modal" data-bs-target="#newRegistro${batePonto[0]}">

                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                        class="bi bi-camera-fill" viewBox="0 0 16 16">
                        <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                        <path
                            d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
                    </svg>

                </button>
            </div>

        </div>
    </div>

    <!-- Modal -->
<div class="modal fade" id="newRegistro${batePonto[0]}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
        <div class="modal-header border-bottom-0">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Registre um horário</h1>
        </div>
        <div class="modal-body">

            ${selectOpt}

            <div class="text-center">

                <div class="position-relative mt-5">
                    <video id="camera${batePonto[0]}" data-facing-mode="user" style="border-radius: 1rem; background-color: rgb(0, 0, 0);" height="250rem" width="250rem" autoplay hidden>
                    </video>
                    <div class="text-center position-absolute" style="top: 40%; left: 45%; width: 3rem; height: 3rem;" id="spinner${batePonto[0]}" hidden>
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>

                <div class="position-relative">
                    <canvas id="fotoCanvas${batePonto[0]}" style="border-radius: 1rem; background-color: rgb(0, 0, 0);" height="250rem" width="250rem" hidden>
                    </canvas>
                </div>

                <script>
                    var canvas = document.getElementById('fotoCanvas${batePonto[0]}')
                        // Obtém o contexto 2D do canvas
                    var ctx = canvas.getContext('2d');

                    // Define a largura e altura do canvas como 0 para limpá-lo
                    canvas.width = 0;
                    canvas.height = 0;
                </script>

                <div class="text-center">
                    <button class="btn btn-danger text-light rounded mt-4 mb-4" id="iniciarCamera${batePonto[0]}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"
                            fill="currentColor" class="bi bi-camera-fill" viewBox="0 0 16 16">
                            <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                            <path
                                d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
                        </svg>
                    </button>

                    <button class="btn btn-danger text-light mt-4 mb-4" id="capturarFoto${batePonto[0]}" style="border-radius: 12rem;" hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-circle text-light" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        </svg>
                    </button>
                </div>
                <div class="text-end" style="margin-top: -4.4rem; margin-right: 3.5rem;">
                    <button class="btn-invisibled btn-sm small" id="inverterCamera${batePonto[0]}" style="transition: transform 0.5s ease;" hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
                            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                            <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
                        </svg>
                    </button>
                </div>
                
                <p style="margin-top: 5rem;" id="p${batePonto[0]}">Capture uma imagem do seu ambiente atual para registrar o horário e a localização.
                </p>
                
                </div>


        </div>
        <div class="modal-footer border-top-0">
            <button type="button" class="btn btn-outline-danger" id="cancelar${batePonto[0]}" data-bs-dismiss="modal">Cancelar</button>
            ${btns}
        </div>
    </div>
</div>
</div>

   
<!-- Modal -->
<div class="modal fade" id="finalizar${batePonto[0]}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered">
<div class="modal-content">
<div class="modal-header">
<h1 class="modal-title fs-5" id="exampleModalLabel">Finalizar registros</h1>
</div>
<div class="modal-body">
<label for="atividade${batePonto[0]}" class="form-label">Atividade <span
class="small">(Obrigatório)</span></label>
<input type="text" class="form-control mb-3" id="atividade${batePonto[0]}" placeholder="Informe brevemente o que foi feito. Ex: Programação FH/FM">

<label for="valor_diaria${batePonto[0]}" class="form-label">Valor diaria <span
class="small">(opcional)</span></label>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">R$</span>
<input type="number" id="valor_diaria${batePonto[0]}" class="form-control">
</div>

<label for="custo_transporte${batePonto[0]}" class="form-label">Custo de transporte <span
class="small">(opcional)</span></label>
<div class="input-group mb-3">
<span class="input-group-text" id="basic-addon1">R$</span>
<input type="number" id="custo_transporte${batePonto[0]}" class="form-control">
</div>

<label for="km_transporte${batePonto[0]}" class="form-label">Km de transporte <span
class="small">(opcional)</span></label>
<div class="input-group mb-3">
<span class="input-group-text text-danger" id="basic-addon1">
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
  class="bi bi-speedometer2" viewBox="0 0 16 16">
  <path
      d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.39.39 0 0 0-.029-.518z" />
  <path fill-rule="evenodd"
      d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A8 8 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3" />
</svg>
</span>
<input type="number" id="km_transporte${batePonto[0]}" class="form-control">
<span class="input-group-text" id="basic-addon1">Km</span>
</div>

</div>
<div class="modal-footer">
<button type="button" class="btn btn-outline-danger" id="cancel${batePonto[0]}" data-bs-dismiss="modal">Cancelar</button>
<button type="button" class="btn btn-danger" id="save${batePonto[0]}">Finalizar</button>
</div>
</div>
</div>
</div>`

                }).catch(erro => {
                    console.error(erro);
                })
            }

            function getDayOfWeek(dateString) {
                const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

                // Corrige a data para o fuso horário local
                const [year, month, day] = dateString.split('-');
                const inputDate = new Date(year, month - 1, day);

                const dayOfWeek = inputDate.getDay();
                return daysOfWeek[dayOfWeek];
            }

            function formatDate(dateString) {
                const [year, month, day] = dateString.split('-');
                return `${day} do ${month}`;
            }
        }

    }).catch(erro => {
        console.error(erro);
    })

}, 600);