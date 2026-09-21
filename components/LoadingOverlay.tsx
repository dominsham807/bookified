import { LoaderCircle } from "lucide-react";

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper" role="status" aria-live="polite">
      <div className="loading-shadow-wrapper bg-(--bg-card) shadow-soft-lg">
        <div className="loading-shadow">
          <LoaderCircle className="loading-animation h-12 w-12 text-(--color-brand)" />
          <p className="loading-title">Preparing your book</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
