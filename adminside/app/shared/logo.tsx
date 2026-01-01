import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-normal text-gray-800 ${className}`}
    >
      Accountant<sup >®</sup>
    </Link>
  );
}