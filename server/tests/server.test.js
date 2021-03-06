const expect = require('chai').expect;
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create new todo', (done) => {
        var text = 'Text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).to.equal(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).to.equal(1);
                    expect(todos[0].text).to.equal(text);
                    done();
                }).catch((e) => done(e)); 
            });
    });

    it('should not create todo with invalid data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }
            Todo.find().then((todos) => {
                expect(todos.length).to.equal(2);
                done();
            }).catch((e) => done(e)); 
        });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(todos[0].text);
            })
            .end(done);
    });
    it ('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });
    it('should return 404 for non-object ids', (done) => {
        request(app)
        .get(`/todos/123`)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).to.equal(hexId);
            })
            
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
             
                Todo.findById(hexId).then((todo) => {
                    expect(todo).to.be.null;
                    done();
                }).catch((e) => done(e));
                
            });
    });
    it ('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });
    it('should return 404 if object id is invalid', (done) => {
        request(app)
        .delete(`/todos/123`)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var body = {
            text: 'Test',
            completed: true
        };
        request(app)
        .patch(`/todos/${hexId}`)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).to.equal(body.text);
            expect(res.body.todo.completed).to.be.true;
            expect(res.body.todo.completedAt).to.be.a('number');
        })
        .end(done);
    });
    it ('should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[0]._id.toHexString();
        var body = {
            text: 'Test',
            completed: false
        };
        request(app)
        .patch(`/todos/${hexId}`)
        .send(body)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).to.equal(body.text);
            expect(res.body.todo.completed).to.be.false;
            expect(res.body.todo.completedAt).to.be.null;
        })
        .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token) //set header
        .expect(200)
        .expect((res) => {
            expect(res.body._id).to.equal(users[0]._id.toHexString());
            expect(res.body.email).to.equal(users[0].email);
        })
        .end(done);
    });
    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', {}) 
        .expect(401)
        .expect((res) => {
            expect(res.body).to.be.empty;
        })
        .end(done);
    });
});

describe('POST /users', () => {
    var newUser = {
        "email": "c@c.lv",
        "password": "123456789"
    };
    it('should create a user', (done) => {
        request(app)
        .post('/users/')
        .send(newUser)
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).to.exist;
            expect(res.body._id).to.exist;
            expect(res.body.email).to.equal(newUser.email);
        })
        .end((err) => {
            if (err) {
                return done(err);
            }

            User.findOne({email: newUser.email}).then((user) => {
                expect(user).to.exist;
                expect(user.password).to.not.equal(newUser.password);
                done();
            });
        });
    });
    it('should return validation errors if request invalid', (done) => {
        request(app)
        .post('/users/')
        .send({
            email: 'aaa',
            password: '123'
        })
        .expect(400)
        .end(done);
    });
    it('should not create user if email in use', (done) => {
        request(app)
        .post('/users/')
        .send({
            email: users[0].email,
            password: '11111111'
        })
        .expect(400)
        .end(done);
    });
});