import logo from "@/images/logo.png";
import Image from "next/image";

export function Logomark(props: any) {
  return <Image src={logo} alt="Logo" {...props} />;
}

export function Logo(props: any) {
  return <Image src={logo} alt="Logo" {...props} />;
}
