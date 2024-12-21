module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Le nom est déjà pris.'
      },
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'users',
    timestamps: true
  })
}
