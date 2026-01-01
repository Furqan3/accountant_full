import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/" className="font-normal text-xl text-gray-800">
      Accountant<sup>®</sup>
    </Link>
  )
}
