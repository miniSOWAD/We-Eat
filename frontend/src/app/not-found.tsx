import Link from "next/link";
export default function NotFound(){return <main className="page"><div className="container empty"><h1>Page not found</h1><p className="muted">The listing may have been removed or the address is incorrect.</p><Link className="button buttonPrimary" href="/listings">Browse available food</Link></div></main>}
