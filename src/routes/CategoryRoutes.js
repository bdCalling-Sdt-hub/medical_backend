const { GetCategories, CreateCategory } = require('../Controller/CategoryController')
const verifyToken = require('../middlewares/Token/verifyToken')

const CategoryRoutes = require('express').Router()
CategoryRoutes.get('/',GetCategories).post('/create-category',verifyToken,CreateCategory).patch('/update-category/:categoryId',).delete('/delete-category/:categoryId',)
module.exports = CategoryRoutes