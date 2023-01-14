var express = require('express');
var router = express.Router();
const { signup, signin, signout } = require('./controller');
const multer = require('multer');
const os = require('os');

router.post('/signup', multer({ dest: os.tmpdir() }).single('foto'), signup);
router.post('/signin', signin);
router.post('/signout', signout);

module.exports = router;
