const { GetCategories } = require('../Controller/CategoryController')

const CategoryRoutes = require('express').Router()
CategoryRoutes.get('/',GetCategories).post('/create-category',).patch('/update-category/:categoryId',).delete('/delete-category/:categoryId',)
module.exports = CategoryRoutes