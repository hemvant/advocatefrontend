export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-accent" />
    </div>
  );
}
