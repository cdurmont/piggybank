
module.exports = {
  DB_CONNECTION: process.env.PIGGYBANK_DB_CONNECTION || 'mongodb://root:example@legion.maison.local:27017/piggybank?retryWrites=true'
};