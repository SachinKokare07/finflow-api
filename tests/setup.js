require('dotenv').config();

process.env.MONGO_URI = process.env.MONGO_URI || 'ongodb+srv://yt:eIKaof2Pkh7vSr9R@firstcluster.4zlcl6r.mongodb.net//finflow_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || '3f6e172adfce5ea35e30d364e841ed12c3bebc383d660ad2d5af3b1901a41fda';
process.env.NODE_ENV = 'test';
process.env.JWT_EXPIRES_IN = '1d';
