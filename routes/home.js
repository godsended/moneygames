var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  if (req.user) {
    console.log(JSON.stringify(req.user));
  }
  res.render('root', { body: "home", header: "header" });
});

router.post('/', function (req, res, next) {
    console.log(req);
    next();
})

module.exports = router;
