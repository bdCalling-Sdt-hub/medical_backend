const FaqRoutes = require('express').Router();
const { CreateFaq, GetAllFaq, DeleteFaq, UpdateFaq } = require('../Controller/FaqController');
const verifyToken = require('../middlewares/Token/verifyToken');
FaqRoutes.get('/get-faqs', GetAllFaq).post('/create-faq', verifyToken, CreateFaq).delete('/delete-faq/:faqId', verifyToken, DeleteFaq).patch('/update-faq/:faqId', verifyToken, UpdateFaq)
module.exports = FaqRoutes