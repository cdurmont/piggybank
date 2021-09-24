
const config = {
  DB_CONNECTION: process.env.PIGGYBANK_DB_CONNECTION || 'mongodb://root:example@legion.maison.local:27017/piggybank_ppd?retryWrites=true',
  PORT: process.env.PIGGYBANK_BACKEND_PORT || 3000,
};

export default config;