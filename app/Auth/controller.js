const User = require('../User/model');
const UserLog = require('../UserLog/model');
const path = require('path');
const fs = require('fs');
const config = require('../../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  signin: async (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
      .then(async (user) => {
        if (user) {
          const checkPassword = bcrypt.compareSync(password, user.password);
          if (checkPassword) {
            const token = jwt.sign(
              {
                user: {
                  id: user.id,
                  // email: user.email,
                  namaLengkap: user.namaLengkap,
                  telp: user.telp,
                  foto: user.foto,
                  role: user.role,
                },
              },
              config.jwtKey
            );

            let userLog = await UserLog({ user: user.id, status: 1 });
            await userLog.save();

            res.status(200).json({
              data: { token },
            });
          } else {
            res.status(403).json({
              message: 'password yang anda masukan salah.',
              fields: { password: { message: 'password yang anda masukan salah.' } },
            });
          }
        } else {
          res.status(403).json({
            message: 'email yang anda masukan belum terdaftar.',
            fields: { email: { message: 'email yang anda masukan belum terdaftar.' } },
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: err.message || `Internal server error`,
        });

        next();
      });
  },

  signout: async (req, res, next) => {
    try {
      const { id } = req.body;

      const isUser = await User.findOne({ _id: id });
      if (!isUser) {
        const error = {
          status: 404,
          errors: {
            kode: { kind: 'Not found', message: 'User tidak ada' },
          },
        };
        throw error;
      }

      let userLog = await UserLog({ user: id, status: 0 });
      await userLog.save();
      res.status(201).json({
        message: 'Data berhasil disimpan',
        data: userLog,
      });
    } catch (err) {
      next(err);
    }
  },

  signup: async (req, res, next) => {
    try {
      const payload = req.body;

      if (req.file) {
        let filepath = req.file.path;
        let filename = `${new Date().getTime()}-${req.file.originalname}`;
        let target_path = path.resolve(config.rootPath, `public/images/user/${filename}`);

        const src = fs.createReadStream(filepath);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on('end', async () => {
          try {
            const user = new User({ ...payload, foto: filename });

            await user.save();

            delete user._doc.password;

            res.status(201).json({ data: user });
          } catch (err) {
            if (err && err.name === 'ValidationError') {
              return res.status(422).json({
                error: true,
                message: err.message,
                fields: err.errors,
              });
            }
            next(err);
          }
        });
      } else {
        let user = new User({ ...payload, foto: 'default.jpg' });
        await user.save();

        delete user._doc.password;

        res.status(201).json({ data: user });
      }
    } catch (err) {
      if (err && err.name === 'ValidationError') {
        return res.status(422).json({
          error: true,
          message: err.message,
          fields: err.errors,
        });
      }
      next(err);
    }
  },
};
