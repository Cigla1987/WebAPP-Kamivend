import { LoaderCircle } from 'lucide-react';

const LoadingSpinner = ({ size = 48 }: { size?: number }) => {
  return (
    <div className="animate-spin inline-block">
      <LoaderCircle size={size} />
    </div>
  );
};

export default LoadingSpinner;
