"use client";
import { motion } from "framer-motion";
import styles from "./hero-visual.module.css";

export function HeroVisual(){
  return <div className={styles.wrap} aria-label="Food sharing illustration">
    <motion.div className={`${styles.card} ${styles.main}`} initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.55}}>
      <div className={styles.icon}>🍱</div><div className={styles.line}/><div className={`${styles.line} ${styles.short}`}/><div style={{display:"flex",gap:8,marginTop:18}}><span className="badge badgeFree">FREE</span><span className="badge badgeMuted">Dhanmondi</span></div>
    </motion.div>
    <motion.div className={`${styles.card} ${styles.side}`} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:.55,delay:.15}}>
      <strong>Food rescued today</strong><div style={{fontSize:42,fontWeight:900,marginTop:8}}>128</div><span className="muted">community portions</span>
    </motion.div>
  </div>
}
