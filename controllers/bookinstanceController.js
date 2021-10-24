const
    BookInstance = require('../models/bookinstance'),
    Book = require('../models/book'),
    async = require('async'),
    { check, validationResult } = require('express-validator');


// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    BookInstance.find({})
    .populate('book')
    .then(qry=>{
        // console.log(qry);
        res.render('bookinstance_list', {title: 'Lista de ejemplares', instance_list: qry});
    })
    .catch(err=>{
        return next(err);
    })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    async.parallel({
        instance: (cb)=>BookInstance.findById(req.params.id, cb).populate('book'),
    })
    .then(qry=>{
        // console.log(qry);
        res.render('instance_detail', {instance: qry.instance});
    })
    .catch(err=>{
        return next(err);
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {

    async.parallel({
        books: (cb)=>Book.find({}, 'title', cb),
        status: (cb)=>BookInstance.find({}, cb)
    })
    .then(qry=>{
        // console.log(qry.books);
        if (qry.status.length > 0){
            res.render('bookinstance_form', {title: 'Crear nuevo ejemplar', books: qry.books, status: qry.status[0].schema.tree.status.enum});
        }
        else {
            res.render('bookinstance_form', {title: 'Crear nuevo ejemplar', books: qry.books, status: BookInstance.schema.tree.status.enum});
        }
    })
    .catch(err=>{
        return next(err);
    })
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    check('imprint').trim().escape()
        .isLength({min: 10}).withMessage('Requiere mínimo 10 caracteres')
        .isAlphanumeric('es-ES', {ignore: ' '}).withMessage('Elimine caracteres no-alfanuméricos'),
    check('book').trim().escape()
        .isLength({min: 1}).withMessage('Debe seleccionar el libro'),
    check('status').escape(),
    check('date').optional({checkFalsy: true}).isISO8601().toDate().withMessage('Fecha inválida'),

    (req, res, next)=>{
        
        const errors = validationResult(req);

        
        let newInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.date
        })
        
        // Al seleccionar un libro y hacer el POST lo que viaja es el value del campo, que se definió como book._id
        // console.log(`SELECTED BOOK: ${newInstance.book}`);
        // console.log(`NEWINSTANCE: ${newInstance}`);

        if(!errors.isEmpty()){
            // console.log(errors);
            async.parallel({
                books: (cb)=>Book.find({}, 'title', cb),
                status: (cb)=>BookInstance.find({}, cb)
            })
            .then(qry=>{
                // console.log(`TEST: ${qry.books[1]}`);
                for (i in qry.books){
                    // console.log(`EVALUANDO: ${qry.books[i]}`);
                    if (!(newInstance.book === undefined)){
                        // console.log(`COMPARANDO CON: ${newInstance.book}`)
                        if (qry.books[i]._id.toString() == newInstance.book.toString()){
                            qry.books[i].selected = 'true';
                            // console.log(`SELECCIONADO: ${qry.books[i]}`);
                        }
                    }
                }
                // Validar y marcar el option que corresponde
                for (let s=0; s<BookInstance.schema.tree.status.enum.length; s++){
                    if (BookInstance.schema.tree.status.enum[s] == newInstance.status){
                        BookInstance.schema.tree.status.enum[s].checked = 'true';
                    }
                }
                res.render('bookinstance_form', {title: 'Crear nuevo ejemplar', books: qry.books, status: BookInstance.schema.tree.status.enum, instance: newInstance, errors: errors.array()})
            })
            .catch(err=>{
                return next(err);
            })
        } else {
            newInstance.save(err=>{
                if (err){
                    return next(err);
                }
                res.redirect(newInstance.url);
                    
            })
        }
    }    
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    // console.log(req.params.id);
    // res.redirect('/catalog/bookinstances');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    console.log(req.params.id);
    BookInstance.deleteOne({_id: req.params.id}, (err)=>{
        if (err) return next(err);
    });
    res.redirect('/catalog/bookinstances');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    async.parallel({
        instance: (cb)=>BookInstance.findById(req.params.id, cb).populate('book')
    })
    .then(qry=>{
        console.log(qry.instance);
        res.render('bookinstance_form', {title: 'Modificar ejemplar', books: qry.instance.book, instance: qry.instance, status: BookInstance.schema.tree.status.enum});
    })
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    check('imprint').trim().escape()
        .isLength({min: 10}).withMessage('Requiere mínimo 10 caracteres')
        .isAlphanumeric('es-ES', {ignore: ' '}).withMessage('Elimine caracteres no-alfanuméricos'),
    check('book').trim().escape()
        .isLength({min: 1}).withMessage('Debe seleccionar el libro'),
    check('status').escape(),
    check('date').optional({checkFalsy: true}).isISO8601().toDate().withMessage('Fecha inválida'),

    (req, res, next)=>{
        
        const errors = validationResult(req);

        
        let newInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.date,
            _id: req.params.id
        })
        
        // Al seleccionar un libro y hacer el POST lo que viaja es el value del campo, que se definió como book._id
        // console.log(`SELECTED BOOK: ${newInstance.book}`);
        // console.log(`NEWINSTANCE: ${newInstance}`);

        if(!errors.isEmpty()){
            // console.log(errors);
            async.parallel({
                books: (cb)=>Book.find({}, 'title', cb),
                status: (cb)=>BookInstance.find({}, cb)
            })
            .then(qry=>{
                // console.log(`TEST: ${qry.books[1]}`);
                for (i in qry.books){
                    // console.log(`EVALUANDO: ${qry.books[i]}`);
                    if (!(newInstance.book === undefined)){
                        // console.log(`COMPARANDO CON: ${newInstance.book}`)
                        if (qry.books[i]._id.toString() == newInstance.book.toString()){
                            qry.books[i].selected = 'true';
                            // console.log(`SELECCIONADO: ${qry.books[i]}`);
                        }
                    }
                }
                // Validar y marcar el option que corresponde
                for (let s=0; s<BookInstance.schema.tree.status.enum.length; s++){
                    if (BookInstance.schema.tree.status.enum[s] == newInstance.status){
                        BookInstance.schema.tree.status.enum[s].checked = 'true';
                    }
                }
                res.render('bookinstance_form', {title: 'Crear nuevo ejemplar', books: qry.books, status: BookInstance.schema.tree.status.enum, instance: newInstance, errors: errors.array()})
            })
            .catch(err=>{
                return next(err);
            })
        } else {
            BookInstance.findByIdAndUpdate(req.params.id, newInstance, {}, err=>{
                if (err){
                    return next(err);
                }
                res.redirect(newInstance.url);
                    
            })
        }
    }    
];
