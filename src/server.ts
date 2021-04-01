import dotenv from 'dotenv';
import app from './app';
import fs from 'fs';
import https from 'https';
import path from 'path';

// load .env file
(() => {
    const result = dotenv.config();
    if (result.error) throw result.error;
})();

/*
const options = {
  key: fs.readFileSync(path.join('..','key.pem')),
  cert: fs.readFileSync(path.join('..','cert.pem'))
};
*/

const port = process.env.PORT || 3000;

/*
https.createServer(options, app).listen(port, () => {
    console.log(`Your app is listening on port ${port}`);
});
*/

app.listen(port, () => {
    console.log(`Your app is listening on port ${port}`);
});