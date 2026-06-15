import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Posts" },
  { href: "/blogs/create", label: "Create Post" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-page flex min-h-16 flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link
          href="/"
          aria-label="Go to blog home"
          className="group inline-flex w-fit items-center gap-3 rounded-xl text-foreground"
        >
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/20 bg-white shadow-soft ring-1 ring-white/70 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md dark:bg-white">
            <Image
              src="/logoPNG.png"
              alt="Bliss Blog logo"
              width={96}
              height={96}
              priority
              unoptimized
              className="size-12 scale-[2.45] object-contain [backface-visibility:hidden]"
            />
          </span>
          <span className="grid gap-0.5 leading-none">
            <span className="text-base font-semibold tracking-normal">
              Bliss Blog
            </span>
            <span className="hidden text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Inspire. Inform.
            </span>
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex w-full items-center gap-3 overflow-x-auto text-sm text-muted-foreground sm:w-auto"
        >
          <div className="flex min-w-max items-center gap-1 rounded-lg border border-border bg-card px-2 py-1">
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
