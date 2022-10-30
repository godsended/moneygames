var express = require('express');
var router = express.Router();
const { adminKey } = require('../private/admin/adminKey');
var { createPgClient } = require('../services/pgService')

router.get(`/${adminKey}`, function (req, res) {
    createPgClient().query('SELECT name, value FROM constants', function (err, constants) {
        if (err) {
            console.log(err.stack);
            res.end(err.stack);
        }
        else {
            res.render('root', { header: 'header', body: 'admin', constants: constants.rows });
        }
    });
});

router.post(`/${adminKey}`, function (req, res) {
    if (req.body.name && req.body.value) {
        createPgClient().query(`UPDATE constants SET name = '${req.body.name}', value = '${req.body.value}'
                                WHERE name = '${req.body.name}'`, function (err, result) {
            if (err) {
                console.log(err.stack);
            }
            else {
                console.log(`Constant ${req.body.name} value -> ${req.body.value}`);
            }
        });
    }
    res.end('GO TO PREVIOUS PAGE');
});

module.exports = router;