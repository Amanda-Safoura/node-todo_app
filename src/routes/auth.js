const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { User } = require('../db/sequelize')
const { ValidationError, UniqueConstraintError } = require('sequelize')

// CREATE an new User
router.post('/register', (req, res) => {

  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      // Promise of User's Create
      return User.create({
        email: req.body.username,
        password: hash
      })
        .then(user => {
          const message = `L'utilisateur ${req.body.username} a bien été créé.`
          res.json({ message, data: user })
        })
    })
    .catch(error => {
      if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
        return res.status(400).json({ message: error.message, data: error })
      }
      const message = `L'utilisateur n'a pas pu être ajouté. Réessayez dans quelques instants.`
      res.status(500).json({ message, data: error })
    })
})

// Connect an User with a JWT
router.post('/login', (req, res) => {

  User.findOne({ where: { email: req.body.username } }).then(user => {

    if (!user) {
      const message = `L'utilisateur demandé n'existe pas.`
      return res.status(404).json({ message })
    }

    bcrypt.compare(req.body.password, user.password).then(isPasswordValid => {
      if (!isPasswordValid) {
        const message = `Le mot de passe est incorrect.`
        return res.status(401).json({ message })
      }

      // Générer un jeton JWT valide pendant 24 heures.
      const token = jwt.sign(
        { userId: user.id },
        process.env.HASH_PRIVATE_KEY,
        { expiresIn: '24h' }
      )

      const message = `L'utilisateur a été connecté avec succès`
      return res.json({ message, data: user, token })
    })
  })
    .catch(error => {
      const message = `L'utilisateur n'a pas pu être connecté. Réessayez dans quelques instants.`
      res.status(500).json({ message, data: error })
    })
})

module.exports = router
