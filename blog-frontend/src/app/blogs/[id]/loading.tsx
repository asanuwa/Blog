export default function BlogDetailsLoading() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />

      <header className="grid gap-5">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-36 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid gap-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-4/5 animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="surface-soft grid gap-4 rounded-xl p-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="size-8 animate-pulse rounded-lg bg-muted" />
              <div className="grid flex-1 gap-2">
                <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="surface-soft grid gap-4 rounded-xl p-5 sm:p-8">
        <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-11/12 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-10/12 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-8/12 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
