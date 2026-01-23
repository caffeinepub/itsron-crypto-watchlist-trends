export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ItsRon. Built with{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-center text-xs text-muted-foreground max-w-md">
          Not financial advice. Cryptocurrency investments are highly volatile and risky. Always do your own research.
        </p>
      </div>
    </footer>
  );
}
