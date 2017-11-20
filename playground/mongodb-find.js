const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect');
    } 
    console.log('connected');

    db.collection('Todos').find({_id}).toArray().then((docs) => {
        console.log('todos:');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('unable to fetch todos');
    });
    
    //db.close();
});