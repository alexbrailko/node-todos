const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect');
    } 
    console.log('connected');

    // db.collection('Todos').insertOne({
    //     text: 'Todo',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('unable to insert todo');
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    // db.collection('Users').insertOne({
    //     name: 'Alex',
    //     age: 30,
    //     location: 'Riga'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('unable to insert user');
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });
    
    db.close();
});