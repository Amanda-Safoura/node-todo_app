const { User } = require("../db/sequelize")

const priorities = ['HIGH', 'MEDIUM', 'LOW']
const statusTypes = ['Done', 'In Progress', 'To Do']

const formatString = (str) => {
    // Remplacer les majuscules précédées de minuscules par un espace suivi de la majuscule
    let formattedStr = str.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitaliser la première lettre
    formattedStr = formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1)

    return formattedStr
}

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Todo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 255],
                    msg: 'Le titre doit contenir entre 3 et 255 caractères.'
                },
                notEmpty: { msg: 'Le titre ne peut pas être vide.' },
                notNull: { msg: 'Le titre est une propriété requise.' }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        assign_to: {
            type: DataTypes.STRING,
            allowNull: true
        },
        priority: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: priorities[1],
            set(value) {
                this.setDataValue('priority', value.toUpperCase())
            },
            validate: {
                hasValidPriority(value) {
                    if (!value) {
                        throw new Error('Une tâche doit avoir une priorité.')
                    }

                    if (!priorities.includes(value.toUpperCase())) {
                        throw new Error(`La priorité de la tâche doit appartenir à la liste suivante : ${priorities}`)
                    }
                }
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value) {
                this.setDataValue('status', formatString(value))
            },
            validate: {
                hasValidStatus(value) {
                    if (!value) {
                        throw new Error('Une tâche doit avoir un status.')
                    }

                    if (!statusTypes.includes(formatString(value))) {
                        throw new Error(`Le status de la tâche doit appartenir à la liste suivante : ${statusTypes}`)
                    }
                }
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id'
            }
        }
    }, {
        tableName: 'todos',
        timestamps: true
    })
}
