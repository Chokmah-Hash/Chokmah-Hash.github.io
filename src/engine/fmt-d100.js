const d100 = () => 1 + Math.floor(Math.random() * 100); /* 1-100 ; 100 se lit « 00 » */
const fmtD100 = (r) => (r === 100 ? "00" : String(r).padStart(2, "0"));

