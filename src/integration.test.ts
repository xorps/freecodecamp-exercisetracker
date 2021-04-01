import request from 'supertest';
import app from './app';
import moment from 'moment';

test('You can POST to /api/exercise/new-user with form data username to create a new user. The returned response will be an object with username and _id properties.', async () => {
    const response = await request(app).post('/api/exercise/new-user').type('form').send({username: 'myuser'});
    expect(response.body).toHaveProperty('username', 'myuser');
    expect(response.body).toHaveProperty('_id');
    const response_2 = await request(app).post('/api/exercise/new-user').type('form').send({username: 'myuser'});
    expect(response_2.body).toMatchObject({error: "username taken"});
});

test("You can make a GET request to api/exercise/users to get an array of all users. Each element in the array is an object containing a user's username and _id", async () => {
    // add another user
    const _ = await request(app).post('/api/exercise/new-user').type('form').send({username: 'myuser_2'});
    // fetch all users
    const response = await request(app).get('/api/exercise/users');
    expect(response.body).toMatchObject([{_id: "1", username: 'myuser'}, {_id: "2", username: 'myuser_2'}]);
});

test("You can POST to /api/exercise/add with form data userId=_id, description, duration, and optionally date. If no date is supplied, the current date will be used. The response returned will be the user object with the exercise fields added", async () => {
    const response = await request(app).post('/api/exercise/add').type('form').send({userId: 1, description: 'Running', duration: 60});
    const today = moment().format('YYYY-MM-DD');
    expect(response.body).toMatchObject({_id: "1", username: 'myuser', description: 'Running', duration: 60, date: today});
    const response_2 = await request(app).post('/api/exercise/add').type('form').send({userId: 2, description: 'Running', duration: 60});
    expect(response_2.body).toMatchObject({_id: "2", username: 'myuser_2', description: 'Running', duration: 60, date: today});
});

test("You can make a GET request to /api/exercise/log with a parameter of userId=_id to retrieve a full exercise log of any user. The returned response will be the user object with a log array of all the exercises added. Each log item has the description, duration, and date properties.", async () => {
    const response = await request(app).get('/api/exercise/log').query({userId: 1});
    const today = moment().format('YYYY-MM-DD');
    expect(response.body).toMatchObject({_id: "1", username: 'myuser', count: 1, log: [{date: today, description: 'Running', duration: 60}]});
});

test("A request to a user's log (/api/exercise/log) returns an object with a count property representing the number of exercises returned.", async () => {
    const response = await request(app).get('/api/exercise/log').query({userId: 1});
    const today = moment().format('YYYY-MM-DD');
    expect(response.body).toMatchObject({_id: "1", username: 'myuser', count: 1, log: [{date: today, description: 'Running', duration: 60}]});
});

test("You can add from, to and limit parameters to a /api/exercise/log request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.", async () => {
    const today = moment().format('YYYY-MM-DD');
    const response = await request(app).get('/api/exercise/log').query({userId: 1, from: today, to: today, limit: 1});
    expect(response.body).toMatchObject({_id: "1", username: 'myuser', count: 1, log: [{date: today, description: 'Running', duration: 60}]});
    const response_2 = await request(app).get('/api/exercise/log').query({userId: 1, from: '2050-01-01', to: '2050-02-02'});
    expect(response_2.body).toMatchObject({_id: "1", username: 'myuser', count: 0, log: []});
});