const express = require('express')
const { Todo, User } = require('../db/sequelize')
const authenticated = require('../middlewares/auth')
const { ValidationError, UniqueConstraintError } = require('sequelize')
const jwt = require('jsonwebtoken')
const sendSampleMail = require('../emails/text_email')
const router = express.Router()

router.use(authenticated)

// CREATE a Todo
router.post('', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] // Extract token
        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }

        let decodedToken
        try {
            decodedToken = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.HASH_PRIVATE_KEY, (error, decodedToken) => {
                    if (error) return reject(error)
                    resolve(decodedToken)
                })
            })
        } catch (error) {
            console.error('Token verification error:', error)
            return res.status(401).json({ message: 'Invalid token' })
        }

        const userId = decodedToken.userId
        const todoData = {
            ...req.body,
            userId
        }

        let todo
        try {
            todo = await Todo.create(todoData)
        } catch (error) {
            if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
                return res.status(400).json({ message: error.message, data: error })
            }
            throw error
        }

        if (req.body.assign_to) {
            const user = await User.findByPk(userId)
            if (user) {
                const username = user.email.split('@')[0]
                await sendSampleMail(
                    req.body.assign_to,
                    "Assignment d'une nouvelle tâche",
                    `L'utilisateur ${username} vous a assigné une nouvelle tâche.\n
                    Titre de la tâche : ${todo.title}\n
                    Priorité de la tâche : ${todo.priority}\n
                    Status de la tâche : ${todo.status}\n\n
                    Description de la tâche :\n
                    \t${todo.description ?? 'Aucune description' }`
                )
            }
        }

        const message = `La tâche ${req.body.title} a bien été créée.`
        res.json({ message, data: todo })

    } catch (error) {
        console.error('An error occurred:', error)
        const message = `La tâche n'a pas pu être ajoutée. Réessayez dans quelques instants.`
        res.status(500).json({ message, data: error })
    }
})


// List all Todos for a User
router.get('', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        // Verify token and extract userId
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.HASH_PRIVATE_KEY, (error, decodedToken) => {
                if (error) return reject(error)
                resolve(decodedToken)
            })
        })

        const userId = decodedToken.userId

        // Fetch todos for the user
        const todos = await Todo.findAll({
            where: { userId },
            order: [['title', 'ASC']]
        })

        const message = 'La liste des tâches a bien été récupérée.'
        res.json({ message, data: todos })

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('Token verification error:', error)
            return res.status(401).json({ message: 'Invalid token', data: error })
        }

        console.error('An error occurred:', error)
        const message = `La liste des tâches n'a pas pu être récupérée. Réessayez dans quelques instants.`
        res.status(500).json({ message, data: error })
    }
})


// GET a Todo with its id
router.get('/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        // Verify token and extract userId
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.HASH_PRIVATE_KEY, (error, decodedToken) => {
                if (error) return reject(error)
                resolve(decodedToken)
            })
        })

        const userId = decodedToken.userId

        // Fetch the specific todo for the user
        const todo = await Todo.findOne({
            where: {
                id: req.params.id,
                userId
            }
        })

        if (!todo) {
            const message = `La tâche demandée n'existe pas. Réessayez avec un autre identifiant.`
            return res.status(404).json({ message })
        }

        const message = 'Une tâche a bien été trouvée.'
        res.json({ message, data: todo })

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('Token verification error:', error)
            return res.status(401).json({ message: 'Invalid token', data: error })
        }

        console.error('An error occurred:', error)
        const message = `La tâche n'a pas pu être récupérée. Réessayez dans quelques instants.`
        res.status(500).json({ message, data: error })
    }
})


// UPDATE a Todo with its id
router.put('/:id', async (req, res) => {
    const id = req.params.id
    const token = req.headers.authorization?.split(' ')[1] // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        // Verify token and extract userId
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.HASH_PRIVATE_KEY, (error, decodedToken) => {
                if (error) return reject(error)
                resolve(decodedToken)
            })
        })

        const userId = decodedToken.userId

        // Find the existing todo
        const oldTodo = await Todo.findOne({ where: { id, userId } })

        if (!oldTodo) {
            return res.status(404).json({ message: `La tâche demandée n'existe pas. Réessayez avec un autre identifiant.` })
        }

        const todoData = {
            ...req.body,
            userId
        }

        // Update the todo
        await Todo.update(todoData, { where: { id, userId } })

        // Retrieve the updated todo
        const updatedTodo = await Todo.findOne({ where: { id, userId } })


        if (oldTodo.assign_to !== updatedTodo.assign_to) {
            // Inform recipient via email
            try {
                await sendSampleMail(
                    updatedTodo.assign_to,
                    "Modification d'une tâche",
                    `La tâche ${updatedTodo.title} a été modifiée.\n
                    (Nouveau) Titre de la tâche : ${updatedTodo.title}\n
                    (Nouveau) Priorité de la tâche : ${updatedTodo.priority}\n
                    (Nouveau) Status de la tâche : ${updatedTodo.status}\n\n
                    (Nouvelle) Description de la tâche :\n
                    \t${updatedTodo.description ?? 'Aucune description'}`
                )
            } catch (emailError) {
                console.error('Error sending email:', emailError)
                // Optionally handle email sending errors here
            }
        }


        const message = `La tâche ${updatedTodo.title} a bien été modifiée.`
        res.json({ message, data: updatedTodo })

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('Token verification error:', error)
            return res.status(401).json({ message: 'Invalid token', data: error })
        }
        if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
            return res.status(400).json({ message: error.message, data: error })
        }
        console.error('An error occurred:', error)
        const message = `La tâche n'a pas pu être modifiée. Réessayez dans quelques instants.`
        res.status(500).json({ message, data: error })
    }
})


// DELETE a Todo with its id
router.delete('/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1] // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        // Verify token and extract userId
        const decodedToken = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.HASH_PRIVATE_KEY, (error, decodedToken) => {
                if (error) return reject(error)
                resolve(decodedToken)
            })
        })

        const userId = decodedToken.userId

        // Find the todo item
        const todo = await Todo.findOne({ where: { id: req.params.id, userId } })

        if (!todo) {
            return res.status(404).json({ message: `La tâche demandée n'existe pas. Réessayez avec un autre identifiant.` })
        }

        // Delete the todo item
        await Todo.destroy({ where: { id: todo.id } })

        const message = `La tâche avec l'identifiant n°${todo.id} a bien été supprimée.`
        res.json({ message, data: todo })

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            console.error('Token verification error:', error)
            return res.status(401).json({ message: 'Invalid token', data: error })
        }
        console.error('An error occurred:', error)
        const message = `La tâche n'a pas pu être supprimée. Réessayez dans quelques instants.`
        res.status(500).json({ message, data: error })
    }
})



module.exports = router
