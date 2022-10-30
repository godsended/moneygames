var { Client } = require('pg');
let { connection } = require('../private/postgres/pgConnection');

function createPgClient() {
    let pgClient = new Client(connection);
    pgClient.connect();

    return pgClient;
}

async function select(client, table, obj) {
    let query = '';
    query = query.concat('SELECT * FROM ', table);

    if (!obj) {
        return await makeQuery(client, query);
    }

    let i = 0;
    for (let prop in obj) {
        if (i == 0) {
            query = query.concat(' WHERE ', prop, ' = ', obj[prop]);
        }
        else {
            query = query.concat(' AND ', prop, ' = ', obj[prop]);
        }
        i += 1;
    }

    return await makeQuery(client, query);
}

function insert(client, table, obj) {

}

async function makeQuery(client, query) {
    var ans;
    let (err, res) = await client.query(query);

    if (err) {
        ans = { error: err };
    }
    else {
        ans = { rows: res.rows, rowsCount: res.rowsCount }
    }

    return ans;
}

exports.createPgClient = createPgClient;
exports.select = select;