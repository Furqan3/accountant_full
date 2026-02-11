import Link from "next/link";
import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-normal text-gray-800 ${className}`}
    >
      <Image src="/logo.png" alt="FilingHub Logo" width={70} height={40} />
    </Link>
  );
}