import { Link } from 'react-router-dom';
import { Button, Card } from '../components/UI';

export const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center px-4 py-10">
    <Card className="max-w-xl p-8 text-center">
      <div className="subtle-label">404</div>
      <h1 className="mt-4 font-display text-4xl font-bold text-white">Page not found</h1>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        The requested route does not exist in this FinFlow frontend.
      </p>
      <div className="mt-8">
        <Button as={Link} to="/app/transactions">
          Go to transactions
        </Button>
      </div>
    </Card>
  </div>
);