export default function LoadingSpinner({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-economist-navy rounded-full animate-spin" />
      <p className="mt-4 font-sans text-sm text-economist-muted">{message}</p>
    </div>
  );
}
