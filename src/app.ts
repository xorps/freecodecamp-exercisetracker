import express from 'express';
import cors from 'cors';
import path from 'path';
import {User, Exercise} from './db';
import {createConnection} from 'typeorm';
import moment from 'moment';

const indexPath = path.join(__dirname, '..', 'views', 'index.html');
const connection = createConnection();

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(indexPath);
});

app.post('/api/exercise/new-user', async (req, res) => {
    const _ = await connection;
    const {username} = req.body;
    if (typeof username !== "string" || username.length < 1)  {
        return res.send({error: "invalid username"});
    }
    let user = await User.findOne({username});
    if (user) {
        return res.send({error: "username taken"});
    }
    user = new User();
    user.username = username;
    user = await user.save();
    res.send({_id: String(user._id), username: user.username});
});

app.get('/api/exercise/users', async (req, res) => {
    const _ = await connection;
    const users = await User.find();
    // freeCodeCamp expects _id as a string
    res.send(users.map(it => ({_id: String(it._id), username: it.username})));
});

app.post('/api/exercise/add', async (req, res) => {
    const _ = await connection;

    class UserError {
        public err: string;
        constructor(err: string) {
            this.err = err;
        }
    }

    function is_string(input: any): input is string {
        return typeof input === "string" && input.length > 0;
    }

    function is_numeric(input: any): boolean {
        if (typeof input === "string") return /^[0-9]+$/.test(input);
        return typeof input === "number";
    }

    try {
        const {userId, description, duration} = req.body;
        const user = await User.findOne(userId);
        if (!user) throw new UserError(`user ${userId} does not exist`);
        if (!is_string(description)) throw new UserError('invalid description');
        if (!is_numeric(duration)) throw new UserError('invalid duration');
        const date = ((date: any) => {
            // date is optional, use todays date if one isn't supplied.
            if (!date) return moment().format('YYYY-MM-DD');
            // validate it
            if (!moment(date, 'YYYY-MM-DD', true).isValid()) throw new UserError('invalid date');
            return date;
        })(req.body.date);
        const exercise = new Exercise();
        exercise.description = description;
        exercise.duration = Number(duration);
        exercise.date = date;
        exercise.user = user;
        const saved_exercise = await exercise.save();
        // freeCodeCamp expects _id as a string
        res.send({
            _id: String(saved_exercise.user!._id),
            username: saved_exercise.user!.username,
            description: saved_exercise.description,
            duration: saved_exercise.duration,
            date: saved_exercise.date
        });
    } catch (err) {
        if (err instanceof UserError) {
            res.send({error: err.err});
        } else {
            throw err;
        }
    }
});

app.get('/api/exercise/log', async (req, res) => {
    const conn = await connection;
    const userId = Number(req.query.userId);
    const user = await User.findOne(userId);
    if (!user) return res.send({error: `User with id '${userId}' not found`});
    let query = conn.createQueryBuilder(Exercise, "exercise")
        .where("exercise.user_id = :id", {id: user._id});
    const from = String(req.query.from);
    const to = String(req.query.to);
    if (moment(from, 'YYYY-MM-DD', true).isValid() && moment(to, 'YYYY-MM-DD').isValid()) {
        query = query.andWhere("exercise.date BETWEEN :from AND :to", {from, to});
    }
    const limit = Number(req.query.limit);
    if (!isNaN(limit)) {
        query = query.limit(limit);
    }
    const exercises = await query.getMany();
    // freeCodeCamp expects _id as a String
    res.send({
        _id: String(user._id!),
        username: user.username!,
        count: exercises.length,
        log: exercises.map(it => ({date: it.date, duration: it.duration, description: it.description}))
    });
});

export default app;