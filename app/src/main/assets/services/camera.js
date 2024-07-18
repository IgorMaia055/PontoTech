setTimeout(() => {
    getBatePonto().then(data => {
        let batePontos = JSON.parse(data)

        if (batePontos.length > 0) {
            for (const batePonto of batePontos[0].values) {

                document.getElementById('selectPeriodo' + batePonto[0]).addEventListener('change', () => {
                    console.log(document.getElementById('selectPeriodo' + batePonto[0]).value)
                    if (document.getElementById('selectPeriodo' + batePonto[0]).value == 'saida') {
                        document.getElementById('salvar' + batePonto[0]).hidden = true
                        document.getElementById('salvarComplete' + batePonto[0]).hidden = false
                    } else {
                        document.getElementById('salvar' + batePonto[0]).hidden = false
                        document.getElementById('salvarComplete' + batePonto[0]).hidden = true
                    }
                })

                document.getElementById('cancelar' + batePonto[0]).addEventListener('click', () => {
                    var canvas = document.getElementById('fotoCanvas' + batePonto[0])
                        // Obtém o contexto 2D do canvas
                    var ctx = canvas.getContext('2d');

                    // Define a largura e altura do canvas como 0 para limpá-lo
                    canvas.width = 0;
                    canvas.height = 0;

                    const video = document.getElementById('camera' + batePonto[0]);
                    video.srcObject.getTracks().forEach(track => track.stop());

                    document.getElementById('fotoCanvas' + batePonto[0]).hidden = true
                    video.hidden = true
                    document.getElementById('capturarFoto' + batePonto[0]).hidden = true
                    document.getElementById('iniciarCamera' + batePonto[0]).hidden = false
                    document.getElementById('salvar' + batePonto[0]).disabled = true
                })

                document.getElementById('iniciarCamera' + batePonto[0]).addEventListener('click', function() {
                    document.getElementById('salvar' + batePonto[0]).disabled = true
                    document.getElementById('salvarComplete' + batePonto[0]).disabled = true

                    document.getElementById('spinner' + batePonto[0]).hidden = false
                    document.getElementById('capturarFoto' + batePonto[0]).hidden = false
                    document.getElementById('iniciarCamera' + batePonto[0]).hidden = true

                    const video = document.getElementById('camera' + batePonto[0]);
                    const canvas = document.getElementById('fotoCanvas' + batePonto[0]);

                    var container = canvas.parentElement;

                    canvas.width = container.clientWidth;
                    canvas.height = 250

                    video.hidden = false
                    canvas.hidden = true

                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        navigator.mediaDevices.getUserMedia({
                                video: {
                                    facingMode: 'user'
                                }
                            })
                            .then(function(stream) {
                                document.getElementById('spinner' + batePonto[0]).hidden = true
                                video.srcObject = stream
                            })
                            .catch(function(error) {
                                if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
                                    // Usuário negou a permissão ou o acesso foi bloqueado por razões de segurança
                                    // alert('Permissão para a câmera foi negada ou bloqueada.')
                                    alert('Permissão para a câmera foi negada ou bloqueada.')
                                    location.reload()
                                } else {
                                    // alert('Erro ao acessar a câmera: ' + error)
                                    alert('Erro ao acessar a câmera: ' + error)
                                    location.reload()
                                }
                            });
                    } else {
                        // alert('getUserMedia não é suportado neste dispositivo')
                        // Navegador não suporta a API getUserMedia
                        alert('getUserMedia não é suportado neste navegador')
                        location.reload()
                    }



                });

                // Captura uma foto ao clicar no botão
                document.getElementById('capturarFoto' + batePonto[0]).addEventListener('click', function() {
                    document.getElementById('spinner' + batePonto[0]).hidden = false
                    document.getElementById('capturarFoto' + batePonto[0]).hidden = true
                    document.getElementById('iniciarCamera' + batePonto[0]).hidden = false

                    const video = document.getElementById('camera' + batePonto[0])
                    const canvas = document.getElementById('fotoCanvas' + batePonto[0])

                    const context = canvas.getContext('2d')

                    document.getElementById('salvar' + batePonto[0]).disabled = false
                    document.getElementById('salvarComplete' + batePonto[0]).disabled = false

                    document.getElementById('spinner' + batePonto[0]).hidden = true

                    // Desenha a imagem do vídeo no canvas
                    context.drawImage(video, 0, 0, canvas.width, canvas.height)

                    video.hidden = true
                    canvas.hidden = false

                    // Para o stream de vídeo para economizar recursos
                    video.srcObject.getTracks().forEach(track => track.stop())
                });
            }
        }
    })
}, 600);