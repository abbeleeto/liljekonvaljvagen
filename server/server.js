const express = require('express');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const moment = require('moment');
const config = require('./config/config').get(process.env.NODE_ENV);
const {auth} = require('./middleware/auth');
const {Review} = require('./models/review');


// MODELS
const {User} = require('./models/user');
const { Item } = require('./models/todo');
const {Todo} = require('./models/todo');
const { TodoItem } = require('./models/todoitem');

const app = express();

//// HANDLEBARS
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + './../views/layouts',
    partialsDir: __dirname + './../views/partials'
}));

app.set('view engine', 'hbs');

// DATABASE
mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

// MIDDLEWARE
app.use('/css', express.static(__dirname + './../public/css'));
app.use('/js', express.static(__dirname + './../public/js'));
app.use('/images', express.static(__dirname + './../public/images'));
app.use(bodyParser.json());
app.use(cookieParser());

//GET
app.get('/', auth, (req, res) => {

    if(req.user) {
        res.redirect('/home');
    } else {
        res.redirect('/home');
    }
});

app.get('/home', auth, (req, res) => {
    if(req.user) {
        res.redirect('/dashboard');
    } else {
        res.render('home');
    }
});

app.get('/register', auth, (req, res) => {
    if(req.user) {
        res.redirect('/dashboard');
    } else {
        res.render('register');
    }
});

app.get('/login', auth, (req, res) => {

    if(req.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login');
    }
});

/* app.get('/games/:id', auth, (req, res) => {

    let addReview = req.user ? true : false;

    Article.findById(req.params.id, (err, article) => {
        if(err) res.status(404).send(err);

        Review.find({'postId': req.params.id}).exec((err, reviews) => {
            res.render('article', {
                date: moment(article.createdAt).format('YYYY-MM-DD'),
                article,
                review: addReview,
                reviews
            });
        });
    });
}); */

app.get('/dashboard', auth, (req, res) => {
    if(!req.user) return res.redirect('/login');

    res.render('dashboard', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
})

app.get('/dashboard/todo', auth, (req, res) => {
    if(!req.user) return res.redirect('/login');

    Todo.find({isDeleted: false}).sort({createdAt: 'desc'}).exec((err, lists) => {

        if(err) res.status(500).send();

        User.find().sort({firstname: 1}).exec((error, users) => {

            if(error) res.status(500).send();
            
            res.render('todo', {
                dashboard: true,
                isAdmin: req.user.role === 1 ? true : false,
                user: req.user.firstname,
                users: users.map(x => x.firstname),
                lists
            });
        });
    });
});

app.get('/dashboard/shoppinglist', auth, (req, res) => {
    if(!req.user) return res.redirect('/login');

    res.render('shoppinglist', {
        dashboard: true,
        isAdmin: req.user.role === 1 ? true : false
    });
});

app.get('/dashboard/logout', auth, (req, res) => {
    req.user.deleteToken(req.token, (err, user) => {
        if(err) return res.status(400).send(err);

        res.redirect('/');
    });
});



// POST
app.post('/api/register', (req, res) => {
    const user = new User(req.body);

    user.save((err, doc) => {
        if(err){ return res.status(400).send(err); }
        else { 
            user.generateToken((err, user) => {
                if(err){ res.status(400).send(err); }

                res.cookie('auth', user.token).send();
            });
        }
    });
});

app.post('/api/login', (req, res) => {
    
    User.findOne({email: req.body.email}, (err, user) => {
        if(err || !user) return res.status(400).json({message: "User not found", err: err});

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(err) return res.status(400).json({message: "There was an error", err: err})

            if(!isMatch) return res.status(400).json({message: "Wrong password", err: err})

            user.generateToken((err, user) => {
                if(err){ return res.status(400).send(err); }

                res.cookie('auth', user.token).send();
            });
        });
    })
});

// NY TODO LISTA
app.post('/api/todo', auth, (req, res) => {

    const items = [];
    req.body.items.forEach(x => {
        const todoItem = {
            text: x.text,
            assignedTo: x.assignedTo,
            isDone: x.isDone
        };

        items.push(todoItem);
    });

    const newList = new Todo({
        title: req.body.title,
        description: req.body.description,
        createdAt: moment(req.body.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        createdBy: req.body.createdBy,
        items,
        isDeleted: false
    });

    newList.save((err, doc) => {
        if(err) return res.status(400).send(err);

        res.status(200).send(doc);
    });
});

// UPPDATERA TODO
app.put('/api/todo/:id', auth, (req, res) => {
    const id = req.params.id;
    const todo = req.body;
    todo.lastUpdate = moment(todo.lastUpdate).format("YYYY-MM-DD HH:mm:ss");


    Todo.findByIdAndUpdate({_id: id}, todo, {new: false, upsert: true}, (err, doc) => {
        if(err) res.status(400).send();

        res.status(200).send({
            doc
        });
    });
});

// RADERA TODO
app.delete('/api/todo/:id', auth, (req, res) => {
    const id = req.params.id;

    Todo.findByIdAndUpdate({_id: id}, {isDeleted: true}, {
        new: false,
        upsert: false
    }, (err, doc) => {
        if(err) res.status(401).send({
            message: `Could not delete ${id}`,
            error: err
        });

        res.status(200).send({
            message: `Deleted list ${id}`
        });
    });

    /* Todo.findByIdAndRemove(id, (err, doc) => {
        if(err) res.status(401).send({
            message: `Could not delete ${id}`,
            error: err
        });

        res.status(200).send({
            message: `Deleted list ${id}`
        });
    }) */
});
/* 
app.post('/api/review', auth, (req, res) => {

    const review = new Review({
        postId: req.body.id,
        username: req.user.username,
        ownerId: req.user._id,
        titlePost: req.body.titlePost,
        review: req.body.review,
        rating: req.body.rating
    });

    console.log(review);

    review.save((err, doc) => {
        if(err) return res.status(400).send(err);

        res.status(200).send();
    });
}); */


app.listen(config.PORT, (err, res) => {
    console.log(`Started at port ${config.PORT}`);
    console.log("Running...");
});