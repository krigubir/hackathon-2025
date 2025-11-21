import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ProgressBar } from '../components/ProgressBar';
import { useApp } from '../contexts/AppContext';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { getCurrentCaptchaIndex } = useApp();
  const currentIndex = getCurrentCaptchaIndex();

  return (
    <div className="min-h-screen bg-background">
      {currentIndex > 0 && currentIndex < 6 && (
        <ProgressBar currentIndex={currentIndex} />
      )}
      <Outlet />
    </div>
  );
}

