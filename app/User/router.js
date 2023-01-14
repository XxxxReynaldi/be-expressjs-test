var express = require('express');
var router = express.Router();
const { index, actionSignin, actionLogout, showProfile, destroy } = require('./controller');
const multer = require('multer');
const os = require('os');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

router.get('/', index); //tidak dipakai
router.post('/', actionSignin); //tidak dipakai
router.get('/show-profile/:id', showProfile);
router.get('/logout', actionLogout);

router.delete('/destroy/:id', destroy);

module.exports = router;
