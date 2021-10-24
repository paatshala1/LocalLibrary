const
    Author = require('../models/author'),
    Book = require('../models/book'),
    async = require('async'),
    { check, validationResult } = require('express-validator')


// Display list of all Authors.
exports.author_list = function(req, res) {
    Author.find()
    .sort([['family_name', 'ascending']])
    .then(qryResult=>{
        // console.log(queryResult);
        res.render('author_list', {title: 'Lista de autores', author_list: qryResult});
    })
    .catch(err=>{
        return next(err);
    })
};

// Display detail page for a specific Author.
exports.author_detail = function(req, res) {
    async.parallel({
        author: (cb)=>Author.findById(req.params.id, cb),
        books: (cb)=>Book.find({author: req.params.id}, cb)
    })
    .then(qry=>{
        // console.log(qry);
        if (qry.author === null){
            let err = new Error('Autor no encontrado...');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', {author: qry.author, books: qry.books});
    })
    .catch(err=>{
        return next(err);
    })
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', {title: 'Crear nuevo autor'});
};

// Handle Author create on POST.
exports.author_create_post = [
    check('first_name').trim().escape()
        .isLength({min: 2}).withMessage(' Mínimo de dos caracteres')
        .isAlpha('en-US', {ignore: ' '}).withMessage('Caracter no-alfanumérico no permitido'),
    check('family_name').trim().escape()
        .isLength({min: 2}).withMessage(' Mínimo de dos caracteres')
        .isAlpha('en-US', {ignore: ' '}).withMessage('Caracter no-alfanumérico no permitido'),
    check('birth', 'Fecha de nacimiento inválida').optional({checkFalsy: true}).isISO8601().toDate(),
    check('death', 'Fecha de deceso inválida').optional({checkFalsy: true}).isISO8601().toDate().isAfter('birth').withMessage('Muerte debe ser posterior a nacimiento'),

    (req, res, next)=>{
        const errors = validationResult(req);

        let newAuthor = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.birth,
            date_of_death: req.body.death
        })

        if (!errors.isEmpty()){
            console.log(newAuthor);
            res.render('author_form', {title: 'Crear nuevo autor', author_req: newAuthor, errors: errors.array()});
        }
        else {
            Author.findOne({first_name: req.body.first_name, family_name: req.body.family_name})
            .then(authorFound=>{
                if (authorFound){
                    res.redirect(authorFound.url)
                }
                else {
                    newAuthor.save(err=>{
                        if (err){
                            return next(err);
                        }
                        res.redirect('/catalog/authors');
                        // res.redirect(newAuthor.url);
                    })
                }
            })
            .catch(err=>{
                return next(err);
            })
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {

    async.parallel({
        author: (cb)=>Author.findById(req.params.id, cb),
        books: (cb)=>Book.find({author: req.params.id}, cb)
    })
    .then(qry=>{
        if (qry.author == null){ //Esto viene de Mongodb, puede ser por aquello de usuarios concurrentes.
            res.redirect('/catalog/authors');
        }
        res.render('author_delete', {title: 'Eliminar: ', author: qry.author, books: qry.books});
    })
    .catch(err=>next(err));

};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {

    async.parallel({
        author: (cb)=>Author.findById(req.body.authorid, cb),
        books: (cb)=>Book.find({author: req.body.authorid}, cb)
    })
    .then(qry=>{
        // console.log(qry.books.length);
        if (qry.books.length > 0){
            Book.deleteMany({author: req.body.authorid}, (err)=>{
                if (err){return next(err)}
            });
            Author.deleteOne({_id: req.body.authorid}, (err)=>{
                if (err){return next(err)};
            });
            res.redirect('/catalog/authors');
        }
        else {
            Author.deleteOne({_id: req.body.authorid}, (err)=>{
                if (err){
                    return next(err);
                }
                res.redirect('/catalog/authors');
            })
        }
    })
    .catch(err=>next(err));
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};
