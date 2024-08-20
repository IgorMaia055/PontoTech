const testUrl = 'https://jsonplaceholder.typicode.com/posts/1'; // URL para teste de conexão, use uma URL estável
const maxResponseTime = 1000; // Tempo máximo de resposta aceitável em milissegundos

// Função para verificar a conexão com a internet
function isOnline() {
    return new Promise((resolve) => {
        const startTime = Date.now();

        fetch(testUrl, { method: 'HEAD', cache: 'no-store' })
            .then((response) => {
                const responseTime = Date.now() - startTime;
                resolve(response.ok && responseTime <= maxResponseTime);
            })
            .catch(() => {
                resolve(false);
            });
    });
}