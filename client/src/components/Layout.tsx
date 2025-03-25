import { FileText } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans text-neutral-900">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="text-primary h-6 w-6 mr-2" />
              <h1 className="text-xl font-semibold text-neutral-900">ADR Workbench</h1>
            </div>
            <nav>
              <a href="#" className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium">Docs</a>
              <a href="#" className="text-neutral-600 hover:text-primary px-3 py-2 text-sm font-medium">About</a>
            </nav>
          </div>
        </div>
      </header>

      {children}

      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm text-neutral-500">ADR Workbench Tool</p>
            <p className="text-xs text-neutral-400 mt-1">A tool for generating Architectural Decision Records</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
