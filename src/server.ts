import dotenv from 'dotenv';
import app from './app';

// load .env file
(() => {
    const result = dotenv.config();
    if (result.error) throw result.error;
})();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Your app is listening on port ${port}`);
});