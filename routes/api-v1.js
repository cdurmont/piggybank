const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// API version
router.get('/version', (req, res) => {
    res.send('v1.0') ;
});

// Users CRUD
router.post('/users', userController.create);
router.get('/users', userController.read);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

router.get('/users/:id', (req, res) => {
    // TODO read user by id
    res.send('Not implemented : read user');
})




module.exports = router;