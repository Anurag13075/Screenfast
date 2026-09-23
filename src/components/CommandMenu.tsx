import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { Command } from "cmdk"
import { Search } from "lucide-react"
import { getPosts, type PostMeta } from "@/lib/mdx"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [posts, setPosts] = React.useState<PostMeta[]>([])
  const router = useRouter()

  React.useEffect(() => {
    // Fetch posts for search index
    getPosts().then(setPosts);

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
      >
        <Search className="h-4 w-4" />
        <span className="font-mono text-xs border border-border px-1.5 py-0.5 rounded-sm">⌘K</span>
      </button>

      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen} 
        label="Global Command Menu"
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in flex items-start justify-center pt-[20vh]"
      >
        <div className="w-full max-w-xl bg-background border border-border rounded-sm shadow-xl overflow-hidden text-foreground animate-in slide-in-from-top-4">
          <Command.Input 
            placeholder="Search posts or jump to..." 
            className="w-full bg-transparent border-b border-border px-4 py-4 outline-none text-foreground placeholder:text-muted-foreground text-sm font-sans"
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Pages" className="px-2 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <Command.Item 
                onSelect={() => runCommand(() => router.navigate({ to: '/' }))}
                className="px-2 py-2 mt-2 text-sm font-sans text-foreground rounded-sm cursor-pointer aria-selected:bg-muted aria-selected:text-accent transition-colors flex items-center gap-2"
              >
                Index
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.navigate({ to: '/about' }))}
                className="px-2 py-2 text-sm font-sans text-foreground rounded-sm cursor-pointer aria-selected:bg-muted aria-selected:text-accent transition-colors flex items-center gap-2"
              >
                About
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-border my-2" />

            <Command.Group heading="Articles" className="px-2 py-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {posts.map(post => (
                <Command.Item 
                  key={post.slug}
                  onSelect={() => runCommand(() => router.navigate({ to: '/blog/$slug', params: { slug: post.slug } }))}
                  className="px-2 py-2 mt-2 text-sm font-sans text-foreground rounded-sm cursor-pointer aria-selected:bg-muted aria-selected:text-accent transition-colors line-clamp-1"
                >
                  {post.title}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  )
}
