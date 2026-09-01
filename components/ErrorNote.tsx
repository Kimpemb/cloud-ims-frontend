export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-tag border border-sold bg-sold/5 px-4 py-3 font-sans text-[14px] text-sold">
      {message}
    </div>
  );
}
