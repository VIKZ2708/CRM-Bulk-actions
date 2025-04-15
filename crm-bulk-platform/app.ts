import express from 'express';
import chalk from 'chalk';
import rateLimit from 'express-rate-limit';
import bulkActionRoutes from './routes/bulkActions';

const app = express();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100, 
  message: {
    status: 429,
    error: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter); // 👈 apply globally
app.use(express.json());
app.use('/api', bulkActionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(chalk.green.bold('🚀 CRM Bulk Platform Server is up and running!'));
  console.log(chalk.blueBright(`📡 Listening on: http://localhost:${PORT}/api`));
  console.log(chalk.yellow('✨ Ready to process bulk actions!'));
});
