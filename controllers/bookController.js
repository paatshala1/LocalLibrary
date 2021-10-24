const 
    Book = require('../models/book'),
    Author = require('../models/author'),
    Genre = require('../models/genre'),
    BookInstance = require('../models/bookinstance'),
    async = require('async'),
    { check, validationResult, body } = require('express-validator');

exports.index = function(req, res) {
    async.parallel({
        book_count: (cb)=>Book.countDocuments({}, cb),
        book_instance_count: (cb)=>BookInstance.countDocuments({}, cb),
        book_instance_avaible_count: (cb)=>BookInstance.countDocuments({status: 'Available'}, cb),
        author_count: (cb)=>Author.countDocuments({}, cb),
        genre_count: (cb)=>Genre.countDocuments({}, cb),
    })
    .then(results=>{
        res.render('index', {title: 'Express Local Library', data: results});
    })
    .catch(err=>{
        res.render('index', {title: 'Express Local Library', error: err});
    });
};

// Display list of all books.
exports.book_list = function(req, res) {
    Book.find({}, ['title', 'author'])
    .populate('author')
    .then(qryResult=>{
        // console.log(queryResult);
        res.render('book_list', {title: 'Listado de libros', book_list: qryResult});
    })
    .catch(err=>{
        return next(err);
    })
};

// Display detail page for a specific book.
exports.book_detail = function(req, res) {
    async.parallel({
        book: (cb)=>Book.findById(req.params.id, cb).populate(['genre', 'author']),
        instances: (cb)=>BookInstance.find({book: req.params.id}, cb)
    })
    .then(qry=>{
        // console.log(qry);
        res.render('book_detail', ({book: qry.book, instances: qry.instances}));
    })
    .catch(err=>{
        return next(err);
    });
};

// Display book create form on GET.
exports.book_create_get = function(req, res) {
    async.parallel({
        authors: (cb)=>Author.find({}, cb),
        genres: (cb)=>Genre.find({}, cb),
    })
    .then(qry=>{
        res.render('book_form', {title: 'Crear nuevo libro', button : {label: 'Crear', icon: 'cloud'},authors: qry.authors, genres: qry.genres});
    })
    .catch(err=>{
        return next(err);
    })
};

// Handle book create on POST.
exports.book_create_post = [

    (req, res, next)=>{
        if(!(req.body.genre instanceof Array)){
            if (typeof req.body.genre === 'undefined'){
                req.body.genre = [];
            }
            else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },
    
    check('title').trim().escape()
        .isLength({min: 2}).withMessage('Título debe tener más de 2 caracteres')
        .isAlphanumeric('es-ES', {ignore: ' '}).withMessage('Caracteres no-alfanuméricos no permitidos'),
    check('author').trim().escape()
        .isLength({min: 2}).withMessage('Debe seleccionar un autor'),
    check('summary').trim().escape()
        .isLength({min: 10}).withMessage('Sinópsis debe contener suficiente información'),
    check('isbn').trim().escape()
        .isLength({min: 10, max: 13}).withMessage('Número ISBN debe contener entre 10 y 13 caracteres'),
    check('genre.*').escape(),

    (req, res, netx)=>{
        const errors = validationResult(req);

        let newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        })

        if(!errors.isEmpty()){
            async.parallel({
                authors: (cb)=>Author.find({}, cb),
                genres: (cb)=>Genre.find({}, cb)
            })
            .then(qry=>{
                for(let i=0; i < qry.genres.length; i++){
                    if (newBook.genre.indexOf(qry.genres[i]._id) > -1){
                        qry.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', {title: 'Crear nuevo autor', button: {label: 'Crear', icon: 'cloud'}, authors: qry.authors, genres: qry.genres, book: newBook, errors: errors.array()});
            })
        } else {
            newBook.save(err=>{
                if (err){
                    return next(err);
                }
                res.redirect(newBook.url);
            })
        }
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    async.parallel({
        book: cb=>Book.findById(req.params.id, cb).populate('author').populate('genre'),
        instances: cb=>BookInstance.find({book: req.params.id}, cb)

    })
    .then(qry=>{
        // console.log(qry.book);
        // console.log(qry.instances);
        res.render('book_delete', {title: `Eliminar: ${qry.book.title}`, book: qry.book, instances: qry.instances});
    })
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    
    async.parallel({
        book: (cb)=>Book.findById({_id: req.params.id}, cb),
        instances: (cb)=>BookInstance.find({book: req.params.id}, cb)
    })
    .then(qry=>{
        console.log(`REQUESTED ID ${req.params.id}`);
        if (qry.instances.length > 0){
            // console.log(`DELETING INSTANCES ID ${qry.instances}`);
            BookInstance.deleteMany({book: req.params.id}, (err)=>{
                if (err) return next(err);
            });
            // console.log(`DELETING BOOK ID ${qry.book}`);
            Book.deleteOne({_id: req.params.id}, (err)=>{
                if (err) return next(err);
            })
        }
        else {
            // console.log(`DELETING BOOK ID ${req.params.id}`);
            Book.deleteOne({_id: req.params.id}, (err)=>{
                if (err) return next(err);
            })
        }
    })
    .catch(err=>{
        return next(err);
    })
    .finally(()=>{
        res.redirect('/catalog/books');
    })
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    
    async.parallel({
        book: (cb)=>Book.findById(req.params.id, cb).populate('author').populate('genre').orFail(new Error('Libro no encontrado')),
        authors: (cb)=>Author.find({}, cb).orFail(new Error('Autor no encontrado')),
        genres: (cb)=>Genre.find({}, cb).orFail(new Error('Género no encontrado'))
        
    })
    .then(qry=>{
        // Marcar los checkbox del género del libro a modificar
        for (let i=0; i<qry.genres.length; i++){
            for (let bg=0; bg<qry.book.genre.length; bg++){
                // console.log(`LG ${qry.genres[i].toString()}; BG: ${qry.book.genre[bg]}`);
                if (qry.genres[i].toString() == qry.book.genre[bg]){
                    qry.genres[i].checked = 'true';
                    break;
                }
            }
        }
        res.render('book_form', {title: 'Modificar libro', button: {label: 'Actualizar', icon: 'update'}, book: qry.book, authors: qry.authors, genres: qry.genres})
    })
    .catch(err=>{
        return next(err);
    })
    
};

// Handle book update on POST.
exports.book_update_post = [
    (req, res, next)=>{
        if (!(req.body.genre instanceof Array)){
            if (typeof req.body.genre === undefined){
                req.body.genre = [];
            }
            else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next(); //TENER CUIDADO CON ESTE NEXT, SINO NO AVANZA Y SE QUEDA AQUÍ
    },
    
    
    check('title').trim().escape()
        .isLength({min: 2}).withMessage('Debe tener al menos dos carateres')
        .isAlphanumeric('es-ES', {ignore: ' '}),
    check('author').trim().escape()
        .isLength({min: 2}).withMessage('Debe seleccionar un author'),
    check('summary').trim().escape()
        .isLength({min: 10}).withMessage('Debe ser clara y útil'),
    check('isbn').trim().escape()
        .isAlphanumeric().withMessage('Elimine caracteres no-Alfanuméricos')
        .isLength({min: 10, max:13}).withMessage('Debe contener entre 10 y 13 caracteres'),
    check('genre.*').escape(),
    
    (req, res, next)=>{

        const errors = validationResult(req);
        
        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre,
            _id: req.params.id
        });
        
        // MUCHÍSIMA ATENCIÓN CON EL CALLBACK DEL async.parallel (en el parámetro y en en el find.)
        if (!(errors.isEmpty())){
            async.parallel({
                authors: (cb)=>Author.find({}, cb),
                genres: (cb)=>Genre.find({}, cb)
            })
            .then(qry=>{
                for (let i=0; i<qry.genres.length; i++){
                    for (let bg=0; bg<book.genre.length; bg++){
                        // console.log(`LG ${qry.genres[i].toString()}; BG: ${book.genre[bg].toString()}`);
                        if (qry.genres[i]._id.toString() == book.genre[bg].toString()){
                            qry.genres[i].checked = 'true';
                            break;
                        }
                    }
                }
                res.render('book_form', {title: 'Modificar libro', button: {label: 'Actualizar', icon: 'update'}, book: book, authors: qry.authors, genres: qry.genres, errors: errors.array()})
            })
            .catch(err=>{
                return next(err);
            })
        }
        else {
            Book.findByIdAndUpdate(req.params.id, book, {}, (err, theBook)=>{
                if (err){
                    return next(err);
                }
                res.redirect(theBook.url);
            })
        }
    }
];
