setTimeout(() => {
    getUsers().then(data => {

        let user = JSON.parse(data)

        if (user.length > 0) {

            getBatePonto(user[0].values[0][1]).then(data => {
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
                            document.getElementById('salvar' + batePonto[0]).disabled = true
                        })

                        let tf = true

                        document.getElementById("inverterCamera" + batePonto[0]).addEventListener('click', () => {

                            var btn = document.getElementById("inverterCamera" + batePonto[0])

                            if (tf) {
                                btn.style.transform = 'rotate(180deg)';

                                tf = false
                            } else {
                                btn.style.transform = 'rotate(-180deg)';

                                tf = true
                            }

                            const video = document.getElementById('camera' + batePonto[0]);
                            const currentFacingMode = video.getAttribute('data-facing-mode') || 'user'; // Padrão: câmera frontal (user)

                            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'; // Alterna entre frontal (user) e traseira (environment)

                            // Para o stream atual, se houver
                            if (video.srcObject) {
                                video.srcObject.getTracks().forEach(track => track.stop());
                            }

                            // Solicita a nova câmera
                            navigator.mediaDevices.getUserMedia({
                                video: {
                                    facingMode: newFacingMode
                                }
                            })
                                .then(function (stream) {
                                    video.srcObject = stream;
                                    video.setAttribute('data-facing-mode', newFacingMode); // Atualiza o atributo para a câmera atual
                                })
                                .catch(function (error) {
                                    alert('Erro ao acessar a câmera: ' + error);
                                    location.reload()
                                });
                        });

                        document.getElementById('iniciarCamera' + batePonto[0]).addEventListener('click', function () {
                            document.getElementById('p' + batePonto[0]).style.marginTop = '2.5rem'

                            document.getElementById('salvar' + batePonto[0]).disabled = true
                            document.getElementById('salvarComplete' + batePonto[0]).disabled = true
                            document.getElementById('capturarFoto' + batePonto[0]).hidden = false
                            document.getElementById('capturarFoto' + batePonto[0]).disabled = true
                            document.getElementById('spinner' + batePonto[0]).hidden = false
                            document.getElementById('iniciarCamera' + batePonto[0]).hidden = true
                            document.getElementById('inverterCamera' + batePonto[0]).hidden = false

                            const video = document.getElementById('camera' + batePonto[0]);
                            const canvas = document.getElementById('fotoCanvas' + batePonto[0]);

                            video.hidden = false;
                            canvas.hidden = true;

                            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                navigator.mediaDevices.getUserMedia({
                                    video: {
                                        facingMode: video.getAttribute('data-facing-mode')
                                    }
                                })
                                    .then(function (stream) {
                                        document.getElementById('spinner' + batePonto[0]).hidden = true;
                                        video.srcObject = stream;
                                        // video.setAttribute('data-facing-mode', 'user'); // Define o atributo para a câmera frontal
                                    })
                                    .catch(function (error) {
                                        alert('Erro ao acessar a câmera: ' + error);
                                        location.reload();
                                    });
                            } else {
                                alert('getUserMedia não é suportado neste navegador');
                                location.reload();
                            }

                            setTimeout(() => {
                                document.getElementById('capturarFoto' + batePonto[0]).disabled = false;
                            }, 600);
                        });

                        // Captura uma foto ao clicar no botão
                        document.getElementById('capturarFoto' + batePonto[0]).addEventListener('click', function () {
                            document.getElementById('p' + batePonto[0]).style.marginTop = '5rem'

                            document.getElementById('spinner' + batePonto[0]).hidden = false
                            document.getElementById('capturarFoto' + batePonto[0]).hidden = true
                            document.getElementById('iniciarCamera' + batePonto[0]).hidden = false
                            document.getElementById('inverterCamera' + batePonto[0]).hidden = true

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
        }

    })
}, 1000);