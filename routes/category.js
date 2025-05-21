const router = require('express').Router();
const {createCategory ,getAllCategory ,getCategory ,removeCategory} = require('../controller/categoryController');

router.route('/').post(createCategory).get(getAllCategory)
router.route('/:id').delete(removeCategory).get(getCategory)
module.exports = router