require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const sequelize = require('./db/sequelize')
const todosRoutes = require('./routes/todo')
const usersRoutes = require('./routes/auth')

const app = express()
const port = process.env.PORT || 3000

app
    .use(express.json())
    .use(cors())

app.use(express.static(path.join(__dirname, 'build')))
sequelize.initDb()


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})


// Utilisation du routeur pour les routes /api
app.use('/api/todos', todosRoutes)
app.use('/api/users', usersRoutes)


// On gère les routes 404.
app.use(({ res }) => {
    const message = 'Impossible de trouver la ressource demandée !'
    res.status(404).json({ message })
})

app.listen(port, () => console.log(`Node.Js Server is running on : http://localhost:${port}`))
