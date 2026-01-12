import Link from "next/link"
import Image from "next/image"

export default function Logo() {
  return (
    <Link href="/" className="font-normal text-xl text-gray-800">
      <Image src="/logo.png" alt="Accountant Logo" width={70} height={40} />
    </Link>
  )
}
