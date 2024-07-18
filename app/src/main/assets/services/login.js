getUsers().then(data => {
    let user = JSON.parse(data)
    const pathname = window.location.pathname;
    const parts = pathname.split('/');

    if (!user.length > 0) {
        if (parts.pop() != 'login.html') {
            location.href = 'login.html'
        }
    }
}).catch(error => {
    console.log(error)
})

function validationLogin() {

    document.getElementById('enterBtn').disabled = true
    document.getElementById('enterBtn').innerHTML = `<div class="spinner-border text-danger" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`

    let login = document.getElementById('login').value;
    let pass = document.getElementById('pass').value;

    // URL da API para onde a requisição será enviada
    const apiUrl = 'https://cyberrobotics.com.br/pontotech_api/goLogin/';

    const data = {
        login: login,
        senha: pass
    };

    fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status != 'erro') {
                let dados = JSON.parse(data.colaborador_arr)

                setUser(dados.id, dados.nome, dados.imagem_perfil, dados.funcao, dados.privilegio, dados.sobrenome, dados.telefone, dados.valor_hora, dados.valor_viagem, dados.valor_carteira).then(() => {

                    location.href = 'index.html'

                }).catch(error => {
                    console.log('Erro na inserção: ' + error)
                })


            } else {
                document.getElementById('enterBtn').disabled = false
                document.getElementById('enterBtn').innerHTML = `Entrar`

                document.getElementById('login').classList.add('is-invalid')
                document.getElementById('pass').classList.add('is-invalid')
            }
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}