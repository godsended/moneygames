var express = require('express');
var router = express.Router();
var { createPgClient } = require('../services/pgService')

router.get('/', function (req, res) {
    if (!req.user) {
        res.redirect('/auth/login');
        return;
    }

    let error = null;
    if (req.body.clientError)
        error = req.body.clientError;

    render(req, res, error);
});

router.post('/client', function (req, res, next) {
    if (!req.user) {
        res.statusCode = 403;
        next();
        return;
    }

    if (!req.body.id) {
        res.statusCode = 400;
        next();
        return;
    }

    createPgClient().query(`UPDATE clients SET user_id = ${req.user.id} WHERE device_id = '${req.body.id}'`, function (err, result) {
        if (err) {
            console.log(err.message);
            console.log(err.stack);
            req.body.clientError = 'Нет игрового клиента с таким id!';
        }
        res.redirect('/user');
    })
});

async function render(req, res, err) {
    let users;

    let pgClient = createPgClient();

    try {
        users = await pgClient.query(`SELECT name, email FROM users WHERE id = ${req.user.id}`)
    }
    catch (err) {
        console.log(err.stack);
    }

    if (!users.rowCount) {
        res.redirect('/auth/login');
        return;
    }

    let clients = [];
    try {
        let clientsResult = await pgClient.query(`SELECT * FROM clients WHERE user_id = ${req.user.id}`);
        if (clientsResult.rowCount > 0) {
            clients = clientsResult.rows;
        }
    }
    catch (err) {
        console.log(err.stack);
    }

    let impressions = 0;
    let balance = 0;
    for (let client of clients) {
        try {
            let impressionsResult = await pgClient.query(`SELECT * FROM impressions WHERE client_id = ${client.id}`)
            client.impressions = impressionsResult.rowCount;
            impressions += client.impressions;
        }
        catch (err) {
            client.impressions = 0;
            console.log(err.stack);
        }
    }

    pgClient.query(`SELECT * FROM constants WHERE name = 'adReward'`, function (queryErr, result) {
        if (queryErr) {
            console.log(queryErr.stack);
        }
        else if (result.rowCount > 0) {
            try {
                balance = impressions * parseInt(result.rows[0].value);
            }
            catch {
                console.log('Error on balance calculating');
            }
        }

        res.render('root', { header: 'header', body: 'user', email: users.rows[0].email, name: users.rows[0].name, clients: clients, error: err, balance: balance });
    })
}

module.exports = router;