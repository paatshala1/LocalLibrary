var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/catalog');
  // res.render('myindex', { title: 'Express' });
});

/* Esto lo adicioné para practicar routes */
// router.get('/products', (req, res)=>{
//   res.render('myproducts');
// });

// router.get('/contact', (req, res)=>{
//   res.render('mycontact');
// });


module.exports = router;
