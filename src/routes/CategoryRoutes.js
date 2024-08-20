const { GetCategories, CreateCategory, DeleteCategory, UpdateCategory } = require('../Controller/CategoryController')
const verifyToken = require('../middlewares/Token/verifyToken')

const CategoryRoutes = require('express').Router()
CategoryRoutes.get('/',GetCategories).post('/create-category',verifyToken,CreateCategory).patch('/update-category/:categoryId',verifyToken,UpdateCategory).delete('/delete-category/:categoryId',verifyToken,DeleteCategory)
module.exports = CategoryRoutes