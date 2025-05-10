type LoadingChartProps = {
  message?: string;
};

export default function LoadingChart({ message = "Loading chart data..." }: LoadingChartProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      <span className="ml-3">{message}</span>
    </div>
  );
}
