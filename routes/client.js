var express = require('express');
var router = express.Router();
var { createPgClient } = require('../services/pgService')

router.post('/', function (req, res, next) {
    if (!req.body.device_id) {
        console.log(JSON.stringify(req.body.device_id));
    }

    console.log(req.body);

    createPgClient().query(`INSERT INTO clients (device_id) VALUES ('${req.body.device_id}')`, function (err, result) {
        if(err) {
            console.log(err.stack);
            next(err);
            return;
        }
    });
});

router.post('/impr', async function (req, res, next) {
    if (!req.body.device_id) {
        console.log(JSON.stringify(req.body.device_id));
    }

    let pgClient = createPgClient();

    let clientId;

    console.log(req.body);

    try{
        result = await pgClient.query(`SELECT id FROM clients WHERE device_id = '${req.body.device_id}'`);
        if (result.rowCount == 0) {
            res.sendStatus(400);
            return;
        }
        clientId = result.rows[0].id;
    }
    catch (err) {
        res.sendStatus(400);
        return;
    }

    pgClient.query(`INSERT INTO impressions (client_id, ads_type) VALUES ('${clientId}', 'rewardedAd')`, function (err, result) {
        if (err) {
            console.log(err.stack);
            next(err);
            return;
        }
        res.sendStatus(200);
    });
});
module.exports = router;
