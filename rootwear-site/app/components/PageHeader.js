'use client';

export default function PageHeader({ title }) {
  return (
    <div className="bg-black/40 py-12 text-center animate-fadeInUp">
      <h1 className="text-4xl font-bold text-accent capitalize">{title}</h1>
    </div>
  );
}
