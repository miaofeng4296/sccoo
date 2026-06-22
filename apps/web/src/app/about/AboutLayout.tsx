export function AboutLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 border-b pb-4">{title}</h1>
      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}
