const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');

const userOneId = new ObjectID;
const userTwoId = new ObjectID;
const users = [{
    _id: userOneId,
    email: 'a@a.com',
    password: 'useOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'b@b.com',
    password: 'useTwoPass'
}];

const todos = [{
    _id: new ObjectID,
    text: 'Todo 1'
}, {
    _id: new ObjectID,
    text: 'Todo 2',
    completed: true,
    completedAt: 123
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};