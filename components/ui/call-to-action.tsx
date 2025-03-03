import { MoveRight, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CTA() {
  return (
    <div className="w-full py-20 lg:py-32">
      <div className="container mx-auto">
        <div className="flex flex-col text-center rounded-xl p-8 lg:p-14 gap-8 items-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
          <div>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">Get Started Today</Badge>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl md:text-5xl tracking-tight font-bold text-white max-w-2xl mx-auto">
              Take Control of Your Crypto Finances
            </h3>
            <p className="text-lg leading-relaxed text-white/90 max-w-2xl mx-auto">
              Stop struggling with spreadsheets and manual tracking. Our platform automatically organizes your crypto transactions, 
              generates tax reports, and provides AI-powered insights to help you make better investment decisions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 bg-white text-blue-700 hover:bg-white/90 hover:text-blue-800">
                Go to Dashboard <BarChart className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-blue-800/40 hover:bg-blue-800/60 text-white border border-white/20">
                Create Account <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center mt-4">
            <Link href="/signin" className="text-white/80 hover:text-white text-sm underline underline-offset-4">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CTA }; 