export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#0d1527] text-white overflow-hidden select-none font-sans">
      {children}
    </div>
  );
}
