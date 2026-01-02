"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
type DashboardHeaderProps = {
  title: string;

};

export default function SearchDetailHeader({
  title,
}: DashboardHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 md:flex-row bg-white p-5 md:items-center md:justify-between rounded-2xl ">
      
      
      <div className="flex items-center gap-6">
  <button
    onClick={() => router.back()}
    className="text-gray-600 hover:text-gray-900 transition-colors"
  >
    <ChevronLeft className="w-10 h-10" />
  </button>
  <h1 className="text-4xl font-semibold text-gray-900">{title}</h1>
</div>

      {/* Right: Search + Sort */}
      <div className="flex items-center text-black gap-3">
        
      
       <Link
            href={"#"}
            className="flex items-center gap-1 text-sm bg-primary font-medium text-white hover:opacity-80 px-4 py-4 rounded-lg transition-opacity"
          >
            Send Email
            <ChevronRight className="h-5 w-5" />
          </Link>
      </div>
    </div>
  );
}
