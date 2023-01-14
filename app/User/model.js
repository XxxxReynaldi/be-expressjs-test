const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const HASH_ROUND = 10;

let userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'email harus diisi'],
    },
    password: {
      type: String,
      required: [true, 'kata sandi harus diisi'],
      maxlength: [225, 'panjang password maksimal 225 karakter'],
    },
    role: {
      type: String,
      enum: ['admin', 'siswa'],
      default: 'siswa',
    },
    status: {
      type: String,
      enum: ['Y', 'N'],
      default: 'Y',
    },
    namaLengkap: {
      type: String,
      required: [true, 'nama harus diisi'],
      maxlength: [225, 'panjang nama harus antara 3 - 225 karakter'],
      minlength: [3, 'panjang nama harus antara 3 - 225 karakter'],
    },
    telp: {
      type: String,
      require: [true, 'nomor telpon harus diisi'],
      maxlength: [13, 'panjang nomor telpon harus antara 9 - 13 karakter'],
      minlength: [9, 'panjang nomor telpon harus antara 9 - 13 karakter'],
    },
    validasi: {
      type: String,
      enum: ['pending', 'valid', 'gagal'],
      default: 'pending',
    },
    foto: { type: String },
  },
  { timestamps: true }
);

userSchema.path('email').validate(
  async function (value) {
    try {
      const count = await this.model('User').countDocuments({ email: value });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} sudah terdaftar`
);

userSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

// userSchema.pre('findOneAndUpdate', function (next) {
// 	console.log('findOneAndUpdate');
// 	this.password = bcrypt.hashSync(this.password, HASH_ROUND);
// 	console.log('this.password', this.password);
// 	next();
// });

module.exports = mongoose.model('User', userSchema);
