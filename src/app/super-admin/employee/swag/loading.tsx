export default function Loading() {
  return (
    <div className="grid px-[30px] py-[24px] gap-5 animate-pulse">
      <div className="h-10 w-48 rounded bg-border" />
      <div className="h-28 w-full rounded-2xl bg-border" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-border" />
        ))}
      </div>
    </div>
  )
}

