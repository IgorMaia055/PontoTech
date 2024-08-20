let SQL;

async function loadWasm() {
    if (!SQL) {
        const wasmBase64 = await AndroidInterface.getWasmFile();
        const wasmBinary = Uint8Array.from(atob(wasmBase64), c => c.charCodeAt(0));
        SQL = await initSqlJs({
            wasmBinary: wasmBinary
        });
        ////console.log("SQL.js loaded");
    }
    return SQL;
}

async function saveDatabase(dbName, dbInstance) {
    const data = dbInstance.export();
    localStorage.setItem(dbName, JSON.stringify(Array.from(data)));
}

// User Database
let dbUser;
async function createUserDatabase() {
    const SQL = await loadWasm();
    dbUser = new SQL.Database();
    dbUser.run(`CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_colaborador INTEGER,
                nome TEXT,
                imagem_perfil TEXT,
                funcao TEXT,
                privilegio TEXT,
                sobrenome TEXT,
                telefone TEXT,
                valor_hora REAL,
                valor_viagem REAL,
                valor_carteira REAL,
                retorno_automatico INTEGER
            );`);
    await saveDatabase('user', dbUser);
    document.getElementById('output').textContent = "User Database and table 'user' created.";
}

async function loadUserDatabase() {
    const SQL = await loadWasm();
    const data = localStorage.getItem('user');
    if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        dbUser = new SQL.Database(uint8Array);
        ////console.log("User Database loaded.");
    } else {
        await createUserDatabase();
    }
}

async function setUser(id_colaborador, nome, imagem_perfil, funcao, privilegio, sobrenome, telefone, valor_hora, valor_viagem, valor_carteira, retorno_automatico) {
    await loadUserDatabase();
    const query = `INSERT INTO user (id_colaborador, nome, imagem_perfil, funcao, privilegio, sobrenome, telefone, valor_hora, valor_viagem, valor_carteira, retorno_automatico) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    dbUser.run(query, [id_colaborador, nome, imagem_perfil, funcao, privilegio, sobrenome, telefone, valor_hora, valor_viagem, valor_carteira, retorno_automatico]);
    await saveDatabase('user', dbUser);
    ////console.log('User inserted');
}

async function getUsers() {
    await loadUserDatabase();
    const res = dbUser.exec("SELECT * FROM user;");
    return JSON.stringify(res, null, 2);
}

async function deleteAllUser() {
    await loadUserDatabase();
    dbUser.run("DELETE FROM user;");
    await saveDatabase('user', dbUser);
    ////console.log('All projects deleted');
}

// Projetos Database
let dbProjetos;
async function createProjetosDatabase() {
    const SQL = await loadWasm();
    dbProjetos = new SQL.Database();
    dbProjetos.run(`CREATE TABLE projetos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_projeto INTEGER,
                nome TEXT,
                area TEXT,
                descricao TEXT,
                local TEXT,
                id_cliente INTEGER
            );`);
    await saveDatabase('projetos', dbProjetos);
}

async function loadProjetosDatabase() {
    const SQL = await loadWasm();
    const data = localStorage.getItem('projetos');
    if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        dbProjetos = new SQL.Database(uint8Array);
        ////console.log("Projetos Database loaded.");
    } else {
        await createProjetosDatabase();
    }
}

async function setProjetos(id_projeto, nome, area, descricao, local, id_cliente) {
    await loadProjetosDatabase();
    const query = `INSERT INTO projetos (id_projeto, nome, area, descricao, local, id_cliente) 
                           VALUES (?, ?, ?, ?, ?, ?);`;
    dbProjetos.run(query, [id_projeto, nome, area, descricao, local, id_cliente]);
    await saveDatabase('projetos', dbProjetos);
    ////console.log('Project inserted');
}

async function getProjetos() {
    await loadProjetosDatabase();
    const res = dbProjetos.exec("SELECT * FROM projetos;");
    return JSON.stringify(res, null, 2);
}

async function deleteAllProjetos() {
    await loadProjetosDatabase();
    dbProjetos.run("DELETE FROM projetos;");
    await saveDatabase('projetos', dbProjetos);
    ////console.log('All projects deleted');
}


// Clientes Database
let dbClientes;
async function createClientesDatabase() {
    const SQL = await loadWasm();
    dbClientes = new SQL.Database();
    dbClientes.run(`CREATE TABLE clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_cliente INTEGER,
                nome TEXT,
                municipio TEXT
            );`);
    await saveDatabase('clientes', dbClientes);
}

async function loadClientesDatabase() {
    const SQL = await loadWasm();
    const data = localStorage.getItem('clientes');
    if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        dbClientes = new SQL.Database(uint8Array);
        ////console.log("Clientes Database loaded.");
    } else {
        await createClientesDatabase();
    }
}

async function setClientes(id_cliente, nome, municipio) {
    await loadClientesDatabase();
    const query = `INSERT INTO clientes (id_cliente, nome, municipio) 
                           VALUES (?, ?, ?);`;
    dbClientes.run(query, [id_cliente, nome, municipio]);
    await saveDatabase('clientes', dbClientes);
    ////console.log('Client inserted');
}

async function getClientes() {
    await loadClientesDatabase();
    const res = dbClientes.exec("SELECT * FROM clientes;");
    return JSON.stringify(res, null, 2);
}

async function deleteAllClientes() {
    await loadClientesDatabase();
    dbClientes.run("DELETE FROM clientes;");
    await saveDatabase('clientes', dbClientes);
    ////console.log('All clientes deleted');
}


window.onload = async () => {
    try {
        await loadUserDatabase();
        await loadProjetosDatabase();
        await loadClientesDatabase();
    } catch (error) {
        //console.error("Error loading databases:", error);
    }
};


// BatePonto Database
let dbBatePonto;

async function createBatePontoDatabase() {
    const SQL = await loadWasm();
    dbBatePonto = new SQL.Database();
    dbBatePonto.run(`CREATE TABLE batePonto (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_colaborador INTEGER,
                id_projeto INTEGER,
                tipo TEXT,
                date TEXT,
                mes TEXT,
                ano TEXT,
                km_transporte REAL,
                diaria REAL,
                custo_transporte REAL,
                atividade TEXT,
                unic_id TEXT,
                upload TEXT
            );`);
    await saveDatabase('batePonto', dbBatePonto);
}

async function loadBatePontoDatabase() {
    const SQL = await loadWasm();
    const data = localStorage.getItem('batePonto');
    if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        dbBatePonto = new SQL.Database(uint8Array);
        ////console.log("BatePonto Database loaded.");
    } else {
        await createBatePontoDatabase();
    }
}

async function setBatePonto(id_colaborador, id_projeto, tipo, date, mes, ano, km_transporte, diaria, custo_transporte, atividade, unic_id, upload) {
    try {
        await loadBatePontoDatabase();

        // Certifique-se de que dbBatePonto está definido corretamente aqui
        if (!dbBatePonto) {
            throw new Error("Database not initialized");
        }

        const query = `
            INSERT INTO batePonto 
            (id_colaborador, id_projeto, tipo, date, mes, ano, km_transporte, diaria, custo_transporte, atividade, unic_id, upload) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        dbBatePonto.run(query, [
            id_colaborador, id_projeto, tipo, date, mes, ano,
            km_transporte, diaria, custo_transporte, atividade, unic_id, upload
        ]);

        await saveDatabase('batePonto', dbBatePonto);
        ////console.log('BatePonto inserted');
    } catch (error) {
        //console.error('Error inserting BatePonto:', error);
    }
}

async function updateBatePonto(km_transporte, diaria, custo_transporte, atividade, id) {
    try {
        await loadBatePontoDatabase();

        // Certifique-se de que dbBatePonto está definido corretamente aqui
        if (!dbBatePonto) {
            throw new Error("Database not initialized");
        }

        const query = `
            UPDATE batePonto SET km_transporte = ?, diaria = ?, custo_transporte = ?, atividade = ? WHERE id = ?;
        `;

        dbBatePonto.run(query, [
            km_transporte, diaria, custo_transporte, atividade, id
        ]);

        await saveDatabase('batePonto', dbBatePonto);
        ////console.log('BatePonto update');
    } catch (error) {
        //console.error('Error update BatePonto:', error);
    }
}

async function updateBatePontoUpload(unic_id, upload) {
    try {
        await loadBatePontoDatabase();

        if (!dbBatePonto) {
            throw new Error("Database not initialized");
        }

        const query = `
            UPDATE batePonto SET upload = ? WHERE unic_id = ?;
        `;

        dbBatePonto.run(query, [
            upload, unic_id
        ]);

        await saveDatabase('batePonto', dbBatePonto);
        //console.log('BatePonto update');
    } catch (error) {
        console.error('Error update BatePonto:', error);
    }
}

async function deleteBatePonto(id) {
    try {
        await loadBatePontoDatabase();

        // Certifique-se de que dbBatePonto está definido corretamente aqui
        if (!dbBatePonto) {
            throw new Error("Database not initialized");
        }

        const query = `
            DELETE FROM batePonto WHERE id = ?;
        `;

        dbBatePonto.run(query, [
            id
        ]);

        await saveDatabase('batePonto', dbBatePonto);
        //console.log('BatePonto delete');
    } catch (error) {
        console.error('Error delete BatePonto:', error);
    }
}

async function deleteBatePontoUnicId(id_unic) {
    try {
        await loadBatePontoDatabase();

        // Certifique-se de que dbBatePonto está definido corretamente aqui
        if (!dbBatePonto) {
            throw new Error("Database not initialized");
        }

        const query = `
            DELETE FROM batePonto WHERE unic_id = ?;
        `;

        dbBatePonto.run(query, [
            id_unic
        ]);

        await saveDatabase('batePonto', dbBatePonto);
        //console.log('BatePonto delete');
    } catch (error) {
        console.error('Error delete BatePonto:', error);
    }
}

async function getBatePonto(id_user) {
    await loadBatePontoDatabase();

    const query = `SELECT * FROM batePonto WHERE id_colaborador = ?;`;
    const res = dbBatePonto.exec(query, [id_user]);

    return JSON.stringify(res, null, 2);
}

async function getBatePontoId(id) {
    await loadBatePontoDatabase();

    const query = `SELECT * FROM batePonto WHERE id = ?;`;
    const res = dbBatePonto.exec(query, [id]);

    return JSON.stringify(res, null, 2);
}

async function getBatePontoIdUnic(id_unic) {
    await loadBatePontoDatabase();

    const query = `SELECT * FROM batePonto WHERE unic_id = ?;`;
    const res = dbBatePonto.exec(query, [id_unic]);

    return JSON.stringify(res, null, 2);
}

async function getBatePontoDesc(id_user) {
    await loadBatePontoDatabase();

    const query = `SELECT * FROM batePonto WHERE id_colaborador = ? ORDER BY id DESC;`;
    const res = dbBatePonto.exec(query, [id_user]);

    return JSON.stringify(res, null, 2);
}


async function deleteAllBatePonto() {
    await loadBatePontoDatabase();
    dbBatePonto.run("DELETE FROM batePonto;");
    await saveDatabase('batePonto', dbBatePonto);
    ////console.log('All BatePonto deleted');
}

// Função para deletar e recriar o banco de dados batePonto
async function deleteAndRecreateBatePontoDatabase() {
    // Remover banco de dados do armazenamento local
    localStorage.removeItem('batePonto');
    // Criar novo banco de dados
    await createBatePontoDatabase();
    ////console.log('BatePonto Database deleted and recreated');
}


// Registros Database
let dbRegistros;

async function createRegistrosDatabase() {
    //console.log('Criando banco de dados de registros'); // Log inicial
    const SQL = await loadWasm();
    dbRegistros = new SQL.Database();
    dbRegistros.run(`CREATE TABLE registros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_batePonto INTEGER,
                periodo TEXT,
                time TEXT,
                imagem BLOB,
                latitude TEXT,
                longitude TEXT,
                upload INTEGER
            );`);
    await saveDatabase('registros', dbRegistros);
    //console.log('Banco de dados de registros criado e salvo'); // Log de sucesso
}


async function loadRegistrosDatabase() {
    //console.log('Carregando banco de dados de registros'); // Log inicial
    const SQL = await loadWasm();
    const data = localStorage.getItem('registros');
    if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        dbRegistros = new SQL.Database(uint8Array);
        //console.log('Banco de dados de registros carregado do localStorage'); // Log de sucesso
    } else {
        await createRegistrosDatabase();
        //console.log('Banco de dados de registros criado'); // Log de criação
    }
}
async function setRegistros(id_batePonto, periodo, time, imagem, latitude, longitude, upload) {
    await loadRegistrosDatabase();
    const query = `
            INSERT INTO registros 
            (id_batePonto, periodo, time, imagem, latitude, longitude, upload) 
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
    dbRegistros.run(query, [id_batePonto, periodo, time, imagem, latitude, longitude, upload]);
    await saveDatabase('registros', dbRegistros);
    //console.log('Registros inserted');
}

async function getRegistros() {
    await loadRegistrosDatabase();
    const res = dbRegistros.exec("SELECT * FROM registros;");
    return JSON.stringify(res, null, 2);
}

async function buscaRegistro(id_bateponto, periodo) {
    await loadRegistrosDatabase();

    const query = `SELECT * FROM registros WHERE id_batePonto = ? AND periodo = ?;`;
    const res = dbRegistros.exec(query, [id_bateponto, periodo]);

    return JSON.stringify(res, null, 2);
}


async function deleteAllRegistros() {
    await loadRegistrosDatabase();
    dbRegistros.run("DELETE FROM registros;");
    await saveDatabase('registros', dbRegistros);
    ////console.log('All Registros deleted');
}

async function deleteRegistro(id_batePonto) {
    await loadRegistrosDatabase();

    const query = `DELETE FROM registros WHERE id_batePonto = ?;`;
    dbRegistros.run(query, [id_batePonto]);
    await saveDatabase('registros', dbRegistros);
}

async function updateRegistros(id_batePonto, periodo, upload) {
    await loadRegistrosDatabase();

    const query = `
        UPDATE registros 
        SET upload = ? 
        WHERE id_batePonto = ? AND periodo = ?;
    `;

    dbRegistros.run(query, [upload, id_batePonto, periodo]);
    await saveDatabase('registros', dbRegistros);
    //console.log(`Registro com id_batePonto ${id_batePonto} e periodo ${periodo} atualizado com sucesso`);
}

async function deleteAndRecreateRegistroDatabase() {
    // Remover banco de dados do armazenamento local
    localStorage.removeItem('registros');
    // Criar novo banco de dados
    await createRegistrosDatabase();
    ////console.log('BatePonto Database deleted and recreated');
}

// Registros Database
let dbLog;

async function createLogDatabase() {
    const SQL = await loadWasm();
    dbLog = new SQL.Database();
    dbLog.run(`CREATE TABLE log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                txt TEXT,
                date TEXT
            );`);
    await saveDatabase('log', dbLog);
}


async function loadLogDatabase() {
    const SQL = await loadWasm();
    const data = localStorage.getItem('log');
    if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        dbLog = new SQL.Database(uint8Array);
    } else {
        await createLogDatabase();
    }
}

async function setLog(txt, date) {
    await loadLogDatabase();
    const query = `
        INSERT INTO log 
        (txt, date) 
        VALUES (?, ?);
    `;
    const formattedDate = date.toISOString();
    dbLog.run(query, [txt, formattedDate]);
    await saveDatabase('log', dbLog);
}

async function getLog() {
    await loadLogDatabase();
    const res = dbLog.exec("SELECT * FROM log;");
    return JSON.stringify(res, null, 2);
}

async function deleteAllLogs() {
    await loadLogDatabase();
    const query = `
        DELETE FROM log;
    `;
    dbLog.run(query);
    await saveDatabase('log', dbLog);
}

async function deleteAllTables() {
    try {
        await loadUserDatabase();
        await loadProjetosDatabase();
        await loadClientesDatabase();
        await loadBatePontoDatabase();
        await loadRegistrosDatabase();
        await loadLogDatabase();

        if (!dbUser || !dbProjetos || !dbClientes || !dbBatePonto || !dbRegistros) {
            throw new Error("One or more databases are not initialized");
        }

        localStorage.removeItem('user')
        localStorage.removeItem('projetos')
        localStorage.removeItem('clientes')
        localStorage.removeItem('batePonto')
        localStorage.removeItem('registros')
        localStorage.removeItem('log')

    } catch (error) {
        console.error('Error deleting tables:', error);
    }
}


window.onload = async () => {
    carregationDb()
};

async function carregationDb() {
    try {
        await loadUserDatabase();
        await loadProjetosDatabase();
        await loadClientesDatabase();
        await loadBatePontoDatabase();
        await loadRegistrosDatabase();
        await loadLogDatabase();

    } catch (error) {
        console.error("Error loading databases:", error);
    }
}