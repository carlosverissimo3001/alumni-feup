type TableTitleProps = {
  title: string;
  icon: React.ReactNode;
};

export default function TableTitle({ title, icon }: TableTitleProps) {
  return (
    <h1 className="text-md font-bold text-[#8C2D19] mb-2 flex items-center gap-2 pl-2 pb-1 flex-shrink-0">
      {icon}
      {title}
    </h1>
  );
}