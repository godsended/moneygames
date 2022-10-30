var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
const { createPgClient } = require('../services/pgService');

router.get('/login', function (req, res) {
    res.render('root', { body: "auth/login", header: "header", error: null });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            res.render('root', { body: "auth/login", header: "header", error: "Неверные почта и/или пароль" });
            return;
        }

        req.login(user, function (loginErr) {
            if (loginErr) {
                next(loginErr);
                return;
            }
            res.redirect('/user')
        })
    }
    )(req, res, next);
});

router.get('/signup', function (req, res, next) {
    res.render('root', { body: "auth/signup", header: "header", error: null });
});

router.post('/signup', function (req, res) {
    createPgClient().query(`INSERT INTO users (email, name, password) 
        VALUES ('${req.body.email}', '${req.body.name}', '${req.body.password}')`, function (err, result) {
        if (err) {
            console.log(`Registration failed: ${JSON.stringify(res.body)}`);
            res.render('root', { body: "auth/signup", header: "header", error: "Пользователь с такой почтой уже существует!" });
            return;
        }
        createPgClient().query(`SELECT * FROM users WHERE email = '${req.body.email}' AND password = '${req.body.password}'`, (err, result) => {
            if (err) {
                console.log(err.stack)
                res.render('root', { body: "auth/signup", header: "header", error: "Ошибка при регистрации" });
                return;
            }
            if (result.rowCount == 0) {
                res.render('root', { body: "auth/signup", header: "header", error: "Ошибка при регистрации" });
                return;
            }

            var user = result.rows[0];
            req.logIn(user, function (err) {
                if (err) {
                    res.render('root', { body: "auth/signup", header: "header", error: "Ошибка при регистрации" });
                }
                res.redirect('/user');
            });
        })
    })
});

router.get('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/auth/login');
    });
});

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.use(new LocalStrategy(function verify(username, password, cb) {
    createPgClient().query(`SELECT * FROM users WHERE email = '${username}' AND password = '${password}'`, (err, res) => {
        if (err) {
            console.log(err.stack)
            return cb(err);
        }
        else {
            if (res.rows.length == 0) {
                return cb(null, false, { message: 'Incorrect username or password.' });
            }

            return cb(null, res.rows[0])
        }
    })
}));

module.exports = router;