const
    Genre = require('../models/genre'),
    Book = require('../models/book'),
    Instance = require('../models/bookinstance'),
    async = require('async'),
    { body, validationResult } = require('express-validator');

let currentGenre;

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre.find()
    .sort([['name', 'ascending']])
    .then(qryResult=>{
        res.render('genre_list', {title: 'Lista de géneros literarios', genre_list: qryResult})
    })
    .catch(err=>{
        return next(err);
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {
    async.parallel({
        genre: function(cb){
            Genre.findById(req.params.id, cb);
        },
        books: function(cb){
            Book.find({genre: req.params.id}, cb)
            .sort({title: 'ascending'});
        }
    })
    .then(qry=>{
        // console.log(qry);
        if (qry.genre === null){
            let err = new Error('Género no encontrado...');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', ({genre: qry.genre, books: qry.books}));
    })
    .catch(err=>{
        return next(err);
    });
};
    

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Crear nuevo género', button: {label: 'Crear', icon: 'cloud'}});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body('genreName').trim()
    .isLength({min: 4}).withMessage('Se requiere un género con más de 4 caracteres')
    .isAlphanumeric('es-ES', {ignore: ' '}).withMessage('Elimine los caracteres no alfanuméricos')
    .escape(),
    
    (req, res, next)=>{
        // console.log(req.body);
        const errors = validationResult(req);

        let newGenre = new Genre({
            name: req.body.genreName
        });

        if (!errors.isEmpty()){
            res.render('genre_form', {title: 'Crear género', genre: newGenre, button: {label: 'Crear', icon: 'cloud'}, errors: errors.array()});
            return;
        }       
        else {
            Genre.findOne({name: req.body.genreName})
            .then(genreFound=>{
                if (genreFound){
                    res.redirect(genreFound.url)
                }
                else {
                    newGenre.save(err=>{
                        if (err){
                            return next(err);
                        }
                        res.redirect(newGenre.url);
                    })
                }
            })
            .catch(err=>{
                return next(err);
            })
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res)=>{

    async.parallel({
        genre: (cb)=>Genre.findById(req.params.id, cb),
        books: (cb)=>Book.find({genre: req.params.id}, cb).populate('author')
    })
    .then(qry=>{
        res.render('genre_delete', {title: 'Género a eliminar', genre: qry.genre, books: qry.books});
    })
    .catch(err=>{
        if (err){
            return next(err);
        }
    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {

    Genre.deleteOne({_id: req.params.id}, err=>{
        if (err) return next(err);
        else res.redirect('/catalog/genres');
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {

    
    async.parallel({
        genre: (cb)=>Genre.findById(req.params.id, cb),
        books: (cb)=>Book.find({genre: req.params.id}, cb)
    })
    .then(qry=>{
        // console.log(qry.genre);
        // console.log(qry.books);
        currentGenre = qry.genre.name
        res.render('genre_form', {title: `Modificar género ${currentGenre}`, genre: qry.genre, button: {label: 'Actualizar', icon: 'update'}});
    })
    .catch(err=>{
        if (err) return next(err);
    })

};

// Handle Genre update on POST.
exports.genre_update_post = [

    body('genreName').trim()
        .isLength({min: 4}).withMessage('Género debe tener al menos 4 caracteres')
        .isAlphanumeric('es-ES', {ignore: ' '}).withMessage('Elimine caracteres no Alfanuméricos'),

        
    (req, res)=>{
        Genre.findById(req.params.id, (err, cg)=>{
            if (err) {
                return next(err);
            }
            else {
                currentGenre = cg.name;
            }
        });

        const errors = validationResult(req);

        let newGenre = new Genre({
            name: req.body.genreName,
            _id: req.params.id
        });

        // console.log(currentGenre);
        // console.log(errors);

        if (!(errors.isEmpty())){
            res.render('genre_form', {title: `Modificar género ${currentGenre}`, button: {label: 'Actualizar', icon: 'update'}, genre: newGenre, errors: errors.array()});
        }
        else {
            Genre.findByIdAndUpdate(req.params.id, newGenre, err=>{
                if (err) return next(err)
            });
            res.redirect('/catalog/genres');
        }
    }
];
