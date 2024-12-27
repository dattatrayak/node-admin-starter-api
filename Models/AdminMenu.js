const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const AdminMenu = sequelize.define('AdminMenu', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      index: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'AdminMenus', // name of the target model
        key: 'id' // key in the target model that the foreign key refers to
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    added_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    tableName: 'adminmenu'
  });
  
  // Define the self-referential association
  AdminMenu.hasMany(AdminMenu, { as: 'SubMenus', foreignKey: 'parent_id' });
  AdminMenu.belongsTo(AdminMenu, { as: 'ParentMenu', foreignKey: 'parent_id' });
  
  module.exports = AdminMenu;