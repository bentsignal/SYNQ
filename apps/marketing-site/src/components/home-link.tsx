import Link from "next/link";

export function HomeLink() {
  return (
    <Link className="home-link" href="/">
      <span aria-hidden="true">←</span> Home
    </Link>
  );
}
