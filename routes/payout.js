var express = require('express');
var router = express.Router();
const FormData = require('form-data');
var { createPgClient } = require('../services/pgService');
var { payeerAccount, payeerApiId, payeerApiPass } = require('../private/payeer/payeerInfo');
var axios = require('axios')

router.post('/payeer', async function (req, res, next) {
    if (!req.user.id) {
        res.sendStatus(401);
        return;
    }

    if(!req.body.payeer_id) {
        res.sendStatus(400);
        return;
    }

    let balance = 0;
    //
    let pgClient = createPgClient();

    try {
        users = await pgClient.query(`SELECT name, email FROM users WHERE id = ${req.user.id}`)
    }
    catch (err) {
        console.log(err.stack);
        next(err);
        return;
    }

    if (!users.rowCount) {
        next(err);
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
        next(err);
        return;
    }
    
    let impressions = 0;
    for (let client of clients) {
        try {
            let impressionsResult = await pgClient.query(`SELECT * FROM impressions WHERE client_id = ${client.id}`)
            impressions += impressionsResult.rowCount;
        }
        catch (err) {
            console.log(err.stack);
            next(err);
            return;
        }
    }

    let result = await pgClient.query(`SELECT * FROM constants WHERE name = 'adReward'`);
    try {
        balance = impressions * parseInt(result.rows[0].value);
    }
    catch {
        console.log('Error on balance calculating');
        next(err);
        return;
    }
    //

    console.log(balance);
    if(!balance) {
        res.sendStatus(400);
        return;
    }

    let params = {
        account: payeerAccount,
        apiId: payeerApiId,
        apiPass: payeerApiPass,
        action: 'payout',
        ps: '1136053',
        sumIn: balance,
        curIn: 'RUB',
        curOut: 'RUB',
        param_ACCOUNT_NUMBER: req.body.payeer_id
    }

    var bodyFormData = new FormData();
    for(let field in params) {
        bodyFormData.append(field, params[field]);
    }

    try{
        let result = await axios({
            method: "post",
            url: "https://payeer.com/ajax/api/api.php",
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data" },
        })
        //let result = await axios.post('https://payeer.com/ajax/api/api.php', params);
        console.log(result.data);

        for (let client of clients) {
            try {
                let impressionsResult = await pgClient.query(`DELETE FROM impressions WHERE client_id = ${client.id}`)
                impressions += impressionsResult.rowCount;
            }
            catch (err) {
                console.log(err.stack);
            }
        }

        res.redirect('/user');
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;