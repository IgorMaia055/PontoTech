const checkInterval = 5000; // Intervalo para verificar a conexão (em milissegundos)
const testUrl = 'https://jsonplaceholder.typicode.com/posts/1'; // URL para teste de conexão, use uma URL estável

// Função para verificar a conexão com a internet
function isOnline() {
    return new Promise((resolve) => {
        fetch(testUrl, { method: 'HEAD', cache: 'no-store' })
            .then((response) => {
                resolve(response.ok);
            })
            .catch(() => {
                resolve(false);
            });
    });
}