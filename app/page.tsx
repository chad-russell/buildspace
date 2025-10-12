import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">BuildSpace</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Visual computation and application development environment
      </p>
      <Link href="/build" className="mt-8">
        <Button size="lg">
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </main>
  )
}

