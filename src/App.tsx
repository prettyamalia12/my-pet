import { PetsProvider } from './hooks/usePets';
import { Dashboard } from './components/dashboard/Dashboard';

export default function App() {
  return (
    <PetsProvider>
      <Dashboard />
    </PetsProvider>
  );
}
