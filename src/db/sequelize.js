const { Sequelize, DataTypes } = require('sequelize')
const TodoModel = require('../models/todo')
const UserModel = require('../models/user')

let sequelize

if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(
        process.env.MYSQL_DATABASE,
        process.env.MYSQL_USERNAME,
        process.env.MYSQL_PASSWORD,
        {
            host: process.env.MYSQL_HOST,
            dialect: 'mysql',
            dialectOptions: {
                timezone: 'Etc/GMT+1',
            },
            logging: true
        })
} else {
    sequelize = new Sequelize('todo_app', 'root', '', {
        host: 'localhost',
        dialect: 'mysql',
        dialectOptions: {
            timezone: 'Etc/GMT+1',
        },
        logging: true
    })

}

const Todo = TodoModel(sequelize, DataTypes)
const User = UserModel(sequelize, DataTypes)

User.hasMany(Todo, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
Todo.belongsTo(User, {
    foreignKey: 'userId'
})


const initDb = () => {
    return sequelize
        .sync()
        .then(_ => {
            console.log('La base de donnée a bien été initialisée !')
        })
        .catch(error => console.log('Une erreur s\'est produite lors de la création des tables:', error))
}

module.exports = {
    initDb, Todo, User
}
