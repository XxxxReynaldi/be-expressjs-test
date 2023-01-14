const User = require('./model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

const bcrypt = require('bcryptjs');
const HASH_ROUND = 10;

module.exports = {
  index: async (req, res) => {
    try {
      if (req.session.user === null || req.session.user === undefined) {
        res.render('admin/users/view_signin', {
          alert,
          title: 'Halaman signin',
        });
      } else {
        res.redirect('/dashboard');
      }
    } catch (err) {
      req.flash('alertMessage', `${err.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/');
    }
  },

  actionSignin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const check = await User.findOne({ email: email });

      if (check) {
        if (check.status === 'Y') {
          const checkPassword = await bcrypt.compare(password, check.password);
          if (checkPassword) {
            req.session.user = {
              id: check._id,
              email: check.email,
              status: check.status,
              name: check.namaLengkap,
            };
            // res.redirect('/dashboard');
            next();
          } else {
            res.status(400).json({
              message: 'Kata sandi yang anda inputkan salah',
            });
          }
        } else {
          res.status(400).json({
            message: 'Mohon maaf status anda belum aktif',
          });
        }
      } else {
        res.status(400).json({
          message: 'Email yang anda inputkan salah',
        });
      }
    } catch (err) {
      next(err);
    }
  },
  actionLogout: (req, res) => {
    req.session.destroy();
    res.status(200).json({
      message: 'Berhasil Logout',
    });
  },

  showProfile: async (req, res, next) => {
    try {
      const { id } = req.params;
      const isUser = await User.findOne({ _id: id });

      if (!isUser) {
        const error = new Error('Data tidak ditemukan !');
        error.status = 404;
        throw error;
      }
      delete isUser._doc.password;

      res.status(200).json({
        message: 'Data profile user berhasil ditampilkan',
        data: isUser,
      });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await User.findOneAndRemove({ _id: id });

      res.status(200).json({
        message: 'Data berhasil dihapus',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },
};
