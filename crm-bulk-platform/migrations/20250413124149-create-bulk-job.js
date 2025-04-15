'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bulk_jobs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      entity_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      action_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      success_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      failure_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bulk_jobs');
  }
};
