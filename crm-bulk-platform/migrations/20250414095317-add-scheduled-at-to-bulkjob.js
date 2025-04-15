module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bulk_jobs', 'scheduled_at', {
      type: Sequelize.DATE,
      allowNull: true, // This can be null for jobs that are not scheduled yet
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bulk_jobs', 'scheduled_at');
  },
};