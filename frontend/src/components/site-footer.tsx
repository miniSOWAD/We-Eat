import Link from "next/link";

export function SiteFooter() {
  return <footer style={{background:"#182235", color:"#fff", padding:"48px 0"}}>
    <div className="container" style={{display:"flex", flexWrap:"wrap", justifyContent:"space-between", gap:24}}>
      <div><strong style={{fontSize:22}}>We Eat</strong><p style={{color:"#c9d3e4", maxWidth:420, lineHeight:1.7}}>A community marketplace for sharing, discounting and exchanging surplus food responsibly.</p></div>
      <div style={{display:"flex", gap:22, flexWrap:"wrap", alignItems:"start"}}><Link href="/listings">Find food</Link><Link href="/safety">Safety</Link><Link href="/how-it-works">How it works</Link></div>
    </div>
  </footer>;
}
