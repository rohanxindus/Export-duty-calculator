import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Info, Package, Globe, X, Shield, ChevronRight, AlertTriangle, CheckCircle, ChevronDown, RefreshCw, Loader } from "lucide-react";

const FTA_DATA = {
  "CEPA": { label: "CEPA", color: "#1d4ed8", desc: "Comprehensive Economic Partnership Agreement with India" },
  "ECTA": { label: "ECTA", color: "#0369a1", desc: "Economic Cooperation & Trade Agreement with India" },
  "FTA":  { label: "FTA",  color: "#047857", desc: "Free Trade Agreement with India" },
  "PTA":  { label: "PTA",  color: "#b45309", desc: "Preferential Trade Agreement with India" },
  "CECA": { label: "CECA", color: "#0e7490", desc: "Comprehensive Economic Cooperation Agreement with India" },
  "TEPA": { label: "TEPA", color: "#7e22ce", desc: "Trade and Economic Partnership Agreement with India" },
  "ASEAN": { label: "ASEAN FTA", color: "#c2410c", desc: "India-ASEAN Free Trade Agreement" },
  "SAFTA": { label: "SAFTA", color: "#15803d", desc: "South Asian Free Trade Area" },
  "APTA": { label: "APTA", color: "#1d4ed8", desc: "Asia-Pacific Trade Agreement" },
  "MERCOSUR": { label: "MERCOSUR PTA", color: "#b91c1c", desc: "India-MERCOSUR Preferential Trade Agreement" },
  "CECPA": { label: "CECPA", color: "#0f766e", desc: "Comprehensive Economic Cooperation & Partnership Agreement" },
};

const COUNTRIES = [
  { name: "Afghanistan", threshold: 0, fta: ["SAFTA"], note: "SAFTA member — reduced tariffs on select Indian goods. Limited postal services; delivery may be delayed." },
  { name: "Albania", threshold: 22, fta: [], note: null },
  { name: "Algeria", threshold: 0, fta: [], note: "Strict import controls. Some goods require special permits." },
  { name: "Angola", threshold: 0, fta: [], note: null },
  { name: "Argentina", threshold: 400, fta: ["MERCOSUR"], note: "India-MERCOSUR PTA: Preferential tariffs on ~450 Indian product lines. $400 threshold applies to small parcel (pequeño envío) channel only." },
  { name: "Armenia", threshold: 200, fta: [], note: null },
  { name: "Aruba", threshold: 0, fta: [], note: null },
  { name: "Australia", threshold: 660, fta: ["ECTA"], note: "India-Australia ECTA (2022): Zero duty on 98.3% of tariff lines for Indian goods incl. textiles, gems, jewelry, leather & footwear. Threshold is AUD 1,000 (~$660 USD). Strict biosecurity — no food, plants, or animal products." },
  { name: "Austria", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (20%) applies on ALL imports. EU introducing €3 flat customs duty on sub-€150 parcels from July 2026." },
  { name: "Azerbaijan", threshold: 200, fta: [], note: null },
  { name: "Bahrain", threshold: 795, fta: [], note: "Threshold is BHD 300 (~$795 USD) for B2C shipments only. B2B shipments have $0 de minimis. GCC member. India-GCC FTA under negotiation." },
  { name: "Bangladesh", threshold: 0, fta: ["SAFTA", "APTA"], note: "SAFTA member — reduced tariffs on many Indian goods. APTA benefits also apply. High duty on electronics & textiles." },
  { name: "Barbados", threshold: 0, fta: [], note: null },
  { name: "Belarus", threshold: 200, fta: [], note: "Sanctions may affect delivery. Verify serviceability before shipping." },
  { name: "Belgium", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (21%) on ALL imports. India-EU FTA negotiations ongoing." },
  { name: "Benin", threshold: 0, fta: [], note: null },
  { name: "Bermuda", threshold: 0, fta: [], note: "High import duties. Clothing taxed at ~25%." },
  { name: "Bhutan", threshold: 0, fta: ["SAFTA", "FTA"], note: "India-Bhutan FTA: Duty-free access for most Indian goods. One of India's strongest bilateral trade agreements." },
  { name: "Bosnia and Herzegovina", threshold: 50, fta: [], note: null },
  { name: "Botswana", threshold: 0, fta: [], note: null },
  { name: "Brazil", threshold: 50, fta: ["MERCOSUR"], note: "India-MERCOSUR PTA: Preferential tariffs on ~450 product lines. Very high base rates — electronics and luxury goods taxed up to 60%." },
  { name: "Brunei Darussalam", threshold: 0, fta: ["ASEAN"], note: "India-ASEAN FTA: Reduced tariffs on many product categories for Indian exporters." },
  { name: "Bulgaria", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (20%) on ALL imports." },
  { name: "Burkina Faso", threshold: 0, fta: [], note: null },
  { name: "Burundi", threshold: 0, fta: [], note: null },
  { name: "Cambodia", threshold: 50, fta: ["ASEAN"], note: "India-ASEAN FTA: Reduced tariffs on many Indian goods." },
  { name: "Cameroon", threshold: 0, fta: [], note: null },
  { name: "Canada", threshold: 15, fta: [], note: "De minimis is CAD 20 (~$15 USD) for non-CUSMA countries like India. Most shipments attract duty." },
  { name: "Cape Verde", threshold: 0, fta: [], note: null },
  { name: "Cayman Islands", threshold: 0, fta: [], note: null },
  { name: "Chile", threshold: 40, fta: ["PTA"], note: "India-Chile PTA (2007): Preferential tariffs on ~2,800 product lines covering textiles, chemicals, and machinery." },
  { name: "China", threshold: 0, fta: ["APTA"], note: "APTA member — limited preferential tariffs. Commercial e-commerce shipments face $0 de minimis." },
  { name: "Colombia", threshold: 200, fta: [], note: null },
  { name: "Costa Rica", threshold: 0, fta: [], note: null },
  { name: "Cote d'Ivoire", threshold: 0, fta: [], note: null },
  { name: "Croatia", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (25%) on ALL imports." },
  { name: "Cuba", threshold: 0, fta: [], note: "Import restrictions in place. Not all goods accepted." },
  { name: "Curacao", threshold: 0, fta: [], note: null },
  { name: "Cyprus", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (19%) on ALL imports." },
  { name: "Czechia", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (21%) on ALL imports." },
  { name: "Democratic Republic of Congo", threshold: 0, fta: [], note: null },
  { name: "Denmark", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (25%) on ALL imports." },
  { name: "Djibouti", threshold: 0, fta: [], note: null },
  { name: "Dominican Republic", threshold: 200, fta: [], note: null },
  { name: "Ecuador", threshold: 400, fta: [], note: null },
  { name: "Egypt", threshold: 0, fta: [], note: "High duties on electronics and luxury goods." },
  { name: "El Salvador", threshold: 0, fta: [], note: null },
  { name: "Eritrea", threshold: 0, fta: [], note: null },
  { name: "Estonia", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (22%) on ALL imports." },
  { name: "Eswatini", threshold: 0, fta: [], note: null },
  { name: "Ethiopia", threshold: 0, fta: [], note: null },
  { name: "Fiji", threshold: 0, fta: [], note: null },
  { name: "Finland", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (25.5%) on ALL imports." },
  { name: "France", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (20%) on ALL imports. India-EU FTA negotiations ongoing." },
  { name: "Gabon", threshold: 0, fta: [], note: null },
  { name: "Gambia", threshold: 0, fta: [], note: null },
  { name: "Georgia", threshold: 300, fta: [], note: null },
  { name: "Germany", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (19%) on ALL imports. India's largest EU trade partner. India-EU FTA under negotiation." },
  { name: "Ghana", threshold: 0, fta: [], note: "Textiles and electronics may face additional levies." },
  { name: "Gibraltar", threshold: 0, fta: [], note: null },
  { name: "Greece", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (24%) on ALL imports." },
  { name: "Guyana", threshold: 0, fta: [], note: null },
  { name: "Hong Kong", threshold: 0, fta: [], note: "Free port — zero customs duty on virtually all goods." },
  { name: "Hungary", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (27%) on ALL imports — highest in EU." },
  { name: "Iceland", threshold: 65, fta: ["TEPA"], note: "India-EFTA TEPA (2024): Reduced tariffs on Indian goods to Iceland, Switzerland, Norway & Liechtenstein." },
  { name: "Indonesia", threshold: 0, fta: ["ASEAN"], note: "India-ASEAN FTA: Reduced tariffs on many categories. De minimis effectively $0 for standard commercial shipments." },
  { name: "Iran (Islamic Republic)", threshold: 0, fta: [], note: "Sanctions and restrictions may affect delivery." },
  { name: "Iraq", threshold: 0, fta: [], note: null },
  { name: "Ireland", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (23%) on ALL imports." },
  { name: "Israel", threshold: 75, fta: [], note: "India-Israel trade relations strong. FTA discussions explored." },
  { name: "Italy", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (22%) on ALL imports." },
  { name: "Japan", threshold: 64, fta: ["CEPA"], note: "India-Japan CEPA (2011): Zero/reduced duty on ~90% of bilateral trade. Threshold is ¥10,000 (~$64 USD). Leather, footwear & knitted apparel excluded (taxed from $0). Japan planning to abolish de minimis by late 2026." },
  { name: "Jersey", threshold: 170, fta: [], note: "British Crown Dependency. Threshold similar to UK (~£135)." },
  { name: "Jordan", threshold: 0, fta: [], note: "High duties. Electronics may face 30%+ charges." },
  { name: "Kazakhstan", threshold: 200, fta: [], note: null },
  { name: "Kenya", threshold: 0, fta: [], note: "Electronics and clothing attract high duty." },
  { name: "Kiribati", threshold: 0, fta: [], note: null },
  { name: "Korea (Republic)", threshold: 150, fta: ["CEPA"], note: "India-Korea CEPA (2010): Reduced duties on Indian textiles, auto parts, chemicals, and seafood." },
  { name: "Kuwait", threshold: 0, fta: [], note: "GCC member. India-GCC FTA under negotiation." },
  { name: "Kyrgyzstan", threshold: 200, fta: [], note: null },
  { name: "Laos", threshold: 50, fta: ["ASEAN"], note: "India-ASEAN FTA: Preferential tariffs on many Indian goods." },
  { name: "Latvia", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (21%) on ALL imports." },
  { name: "Liberia", threshold: 0, fta: [], note: null },
  { name: "Liechtenstein", threshold: 0, fta: ["TEPA"], note: "India-EFTA TEPA (2024): Reduced tariffs for Indian goods. Follows Swiss customs." },
  { name: "Lithuania", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (21%) on ALL imports." },
  { name: "Luxembourg", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (17%) on ALL imports — lowest in EU." },
  { name: "Macao (China)", threshold: 0, fta: [], note: "Free port — zero customs duty on virtually all goods." },
  { name: "Malawi", threshold: 0, fta: [], note: null },
  { name: "Malaysia", threshold: 105, fta: ["ASEAN", "CECA"], note: "India-Malaysia CECA (2011): Zero/reduced duty on palm oil, electronics, textiles & more. Threshold is MYR 500 (~$105 USD)." },
  { name: "Maldives", threshold: 0, fta: ["SAFTA"], note: "SAFTA member — preferential tariffs on Indian goods." },
  { name: "Mali", threshold: 0, fta: [], note: null },
  { name: "Malta", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (18%) on ALL imports." },
  { name: "Mauritius", threshold: 0, fta: ["CECPA"], note: "India-Mauritius CECPA (2021): Zero duty on many Indian goods including textiles, food products, and jewelry." },
  { name: "Mexico", threshold: 0, fta: [], note: "De minimis eliminated January 2025. All courier/postal imports now subject to duty." },
  { name: "Moldova", threshold: 200, fta: [], note: null },
  { name: "Mongolia", threshold: 200, fta: [], note: null },
  { name: "Montenegro", threshold: 50, fta: [], note: null },
  { name: "Morocco", threshold: 0, fta: [], note: "Very high duties. Textiles may attract 40%+." },
  { name: "Mozambique", threshold: 0, fta: [], note: null },
  { name: "Myanmar", threshold: 0, fta: ["ASEAN"], note: "India-ASEAN FTA: Some preferential tariffs. Verify serviceability." },
  { name: "Namibia", threshold: 0, fta: [], note: null },
  { name: "Nauru", threshold: 0, fta: [], note: null },
  { name: "Nepal", threshold: 0, fta: ["SAFTA", "FTA"], note: "India-Nepal Treaty of Trade: Most Indian goods enter duty-free or at very low rates." },
  { name: "Netherlands", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (21%) on ALL imports. Major re-export hub." },
  { name: "New Zealand", threshold: 600, fta: [], note: "Threshold is NZD 1,000 (~$600 USD). Strict biosecurity — no food, plants, or animal products." },
  { name: "Niger", threshold: 0, fta: [], note: null },
  { name: "Nigeria", threshold: 0, fta: [], note: "Electronics and textiles face stricter customs checks." },
  { name: "North Macedonia", threshold: 100, fta: [], note: null },
  { name: "Norway", threshold: 32, fta: ["TEPA"], note: "India-EFTA TEPA (2024): Reduced tariffs on Indian goods. Threshold is NOK 350 (~$32 USD)." },
  { name: "Oman", threshold: 0, fta: [], note: "GCC member. India-GCC FTA under negotiation." },
  { name: "Pakistan", threshold: 0, fta: ["SAFTA"], note: "SAFTA member (limited implementation). Trade relations subject to political conditions." },
  { name: "Panama (Republic)", threshold: 0, fta: [], note: null },
  { name: "Papua New Guinea", threshold: 0, fta: [], note: null },
  { name: "Paraguay", threshold: 0, fta: ["MERCOSUR"], note: "India-MERCOSUR PTA: Preferential tariffs on select product lines." },
  { name: "Philippines", threshold: 175, fta: ["ASEAN"], note: "India-ASEAN FTA: Reduced tariffs on many categories. Threshold is PHP 10,000 (~$175 USD)." },
  { name: "Poland", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (23%) on ALL imports." },
  { name: "Portugal", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (23%) on ALL imports." },
  { name: "Qatar", threshold: 0, fta: [], note: "GCC member. India-GCC FTA under negotiation." },
  { name: "Romania", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (19%) on ALL imports." },
  { name: "Russian Federation", threshold: 200, fta: [], note: "Sanctions may affect delivery. Verify serviceability." },
  { name: "Rwanda", threshold: 0, fta: [], note: null },
  { name: "Saudi Arabia", threshold: 266, fta: [], note: "Threshold is SAR 1,000 (~$266 USD). 15% VAT applies. GCC member. India-GCC FTA under negotiation." },
  { name: "Senegal", threshold: 0, fta: [], note: null },
  { name: "Serbia", threshold: 50, fta: [], note: null },
  { name: "Sierra Leone", threshold: 0, fta: [], note: null },
  { name: "Singapore", threshold: 300, fta: ["ASEAN", "CECA"], note: "India-Singapore CECA (2005): Zero customs duty on virtually all goods. Threshold is SGD 400 (~$300 USD) for GST exemption. 9% GST applies above threshold." },
  { name: "Slovakia", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (20%) on ALL imports." },
  { name: "Slovenia", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (22%) on ALL imports." },
  { name: "Solomon Islands", threshold: 0, fta: [], note: null },
  { name: "South Africa", threshold: 25, fta: [], note: "Threshold is ZAR 500 (~$25 USD). Very low — most parcels attract duty." },
  { name: "Spain", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (21%) on ALL imports. Canary Islands have separate duties." },
  { name: "Sri Lanka", threshold: 0, fta: ["SAFTA", "FTA"], note: "India-Sri Lanka FTA (2000): Zero duty on ~5,000 Indian product lines including textiles, spices, machinery & plastics." },
  { name: "Sudan", threshold: 0, fta: [], note: null },
  { name: "Sweden", threshold: 160, fta: [], note: "EU member. Threshold is €150 (~$160 USD). VAT (25%) on ALL imports." },
  { name: "Switzerland", threshold: 0, fta: ["TEPA"], note: "India-EFTA TEPA (2024): Tariff reductions for Indian exports incl. textiles, pharma & chemicals. Duties waived only if calculated tax < 5 CHF — effectively $0 threshold." },
  { name: "Taiwan", threshold: 50, fta: [], note: null },
  { name: "Tajikistan", threshold: 200, fta: [], note: null },
  { name: "Tanzania", threshold: 0, fta: [], note: null },
  { name: "Thailand", threshold: 0, fta: ["ASEAN"], note: "India-ASEAN FTA + India-Thailand EHS: Reduced tariffs on ~82 product lines. De minimis (1,500 THB) eliminated January 1, 2026. All imports now face duty." },
  { name: "Togo", threshold: 0, fta: [], note: null },
  { name: "Tunisia", threshold: 0, fta: [], note: "Very high duties. Most imported goods taxed heavily." },
  { name: "Türkiye", threshold: 0, fta: [], note: "De minimis (€30) removed February 6, 2026. All imports now face duty. Textiles face up to 30%." },
  { name: "Turkmenistan", threshold: 200, fta: [], note: null },
  { name: "Tuvalu", threshold: 0, fta: [], note: null },
  { name: "Uganda", threshold: 0, fta: [], note: null },
  { name: "Ukraine", threshold: 150, fta: [], note: "Verify serviceability before shipping." },
  { name: "United Arab Emirates", threshold: 81, fta: ["CEPA"], note: "India-UAE CEPA (2022): Zero duty on Indian textiles, gems, jewelry, leather, plastics, furniture & more — regardless of value. Threshold is AED 300 (~$81 USD). 5% VAT applies. India's 3rd largest trade partner." },
  { name: "United Kingdom", threshold: 170, fta: ["FTA"], note: "India-UK FTA: Reduced tariffs on Indian goods. Threshold is £135 (~$170 USD). VAT (20%) on ALL imports. UK plans to review this threshold by March 2029." },
  { name: "United States of America", threshold: 0, fta: [], note: "De minimis ($800) formally suspended for all countries, effective August 29, 2025. 10% baseline tariff applies on all imports. Additional tariffs may apply by product category." },
  { name: "Uruguay", threshold: 200, fta: ["MERCOSUR"], note: "India-MERCOSUR PTA: Preferential tariffs on select product lines." },
  { name: "Uzbekistan", threshold: 200, fta: [], note: null },
  { name: "Vietnam", threshold: 0, fta: ["ASEAN"], note: "India-ASEAN FTA: Reduced tariffs on many Indian goods. De minimis (VND 1M / ~$40) eliminated February 18, 2025. All imports now face duty." },
  { name: "Yemen", threshold: 0, fta: [], note: "Limited services. Delivery may be severely delayed." },
  { name: "Zambia", threshold: 0, fta: [], note: null },
  { name: "Zimbabwe", threshold: 0, fta: [], note: "Very high duties on most imported goods." },
];

const POPULAR = [
  { name: "United States of America", short: "USA", flag: "\u{1F1FA}\u{1F1F8}" },
  { name: "United Kingdom", short: "UK", flag: "\u{1F1EC}\u{1F1E7}" },
  { name: "United Arab Emirates", short: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },
  { name: "Australia", short: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  { name: "Germany", short: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  { name: "Japan", short: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
  { name: "Singapore", short: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  { name: "Canada", short: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  { name: "Saudi Arabia", short: "KSA", flag: "\u{1F1F8}\u{1F1E6}" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee", flag: "\u{1F1EE}\u{1F1F3}" },
  { code: "EUR", symbol: "\u20AC", name: "Euro", flag: "\u{1F1EA}\u{1F1FA}" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "\u{1F1E6}\u{1F1EA}" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "\u{1F1E6}\u{1F1FA}" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "\u{1F1E8}\u{1F1E6}" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "\u{1F1F8}\u{1F1EC}" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "\u{1F1F8}\u{1F1E6}" },
];

const C = {
  xOrange: "#F5921B",
  xYellow: "#F9B233",
  xBlue: "#1A75BB",
  xNavy: "#1B3A6B",
  ipRed: "#C8102E",
  ipYellow: "#F4C430",
};

export default function App() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showFta, setShowFta] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showCurr, setShowCurr] = useState(false);
  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const valRef = useRef(null);
  const currRef = useRef(null);

  // Fetch exchange rates
  useEffect(() => {
    setRatesLoading(true);
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then(r => r.json())
      .then(d => { setRates(d.rates); setRatesLoading(false); })
      .catch(() => { setRatesError(true); setRatesLoading(false); });
  }, []);

  // Convert input value to USD
  const valueInUSD = useMemo(() => {
    if (!value || isNaN(parseFloat(value))) return null;
    const v = parseFloat(value);
    if (v <= 0) return null;
    if (currency.code === "USD") return v;
    if (!rates || !rates[currency.code]) return v;
    return v / rates[currency.code];
  }, [value, currency, rates]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  }, [query]);

  const result = useMemo(() => {
    if (!selected || valueInUSD === null) return null;
    return { dutyFree: valueInUSD <= selected.threshold, v: valueInUSD, inputVal: parseFloat(value) };
  }, [selected, valueInUSD, value]);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) setOpen(false);
      if (currRef.current && !currRef.current.contains(e.target)) setShowCurr(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const pick = (c) => { setSelected(c); setQuery(c.name); setOpen(false); setShowFta(false); setTimeout(() => valRef.current?.focus(), 80); };
  const clear = () => { setSelected(null); setQuery(""); setValue(""); setShowFta(false); inputRef.current?.focus(); };
  const ftaCount = useMemo(() => COUNTRIES.filter(c => c.fta?.length > 0).length, []);
  const fmtUSD = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const fmtCurr = (n) => currency.symbol + " " + parseFloat(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>

      {/* ══ HEADER ══ */}
      <div style={{ background: `linear-gradient(140deg, ${C.xNavy} 0%, ${C.xBlue} 45%, ${C.xOrange} 100%)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "220px", height: "220px", borderRadius: "50%", background: `radial-gradient(circle, ${C.xYellow}15, transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: "-40px", left: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, ${C.ipRed}12, transparent 70%)` }} />

        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px 20px 36px", position: "relative", zIndex: 1 }}>
          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff", letterSpacing: "0.03em" }}>XINDUS</div>
                <div style={{ fontSize: "8px", fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: "0.16em", marginTop: "-1px" }}>TRADE NETWORKS</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {[`${COUNTRIES.length} Countries`, `${ftaCount} FTA`].map(t => (
                <div key={t} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "20px", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "10px", fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Title block */}
          <div style={{ maxWidth: "380px" }}>
            <h1 style={{ fontSize: "clamp(26px, 6.5vw, 36px)", fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Export Duty Calculator
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", margin: 0, lineHeight: 1.5, fontWeight: 400 }}>
              Check de minimis thresholds & FTA benefits for{" "}
              <span style={{ color: C.ipYellow, fontWeight: 700 }}>India Post</span>{" "}
              shipments worldwide
            </p>
          </div>

          {/* India Post badge */}
          <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px", background: `linear-gradient(135deg, ${C.ipRed}25, ${C.ipYellow}15)`, border: `1px solid ${C.ipRed}30`, borderRadius: "8px", padding: "5px 12px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: C.ipRed }} />
            <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em" }}>FOR INDIA POST EXPORTS</span>
          </div>
        </div>
      </div>

      {/* ══ MAIN ══ */}
      <div style={{ maxWidth: "600px", margin: "-20px auto 0", padding: "0 16px 60px", position: "relative", zIndex: 2 }}>

        {/* ── INPUT CARD ── */}
        <div style={{ background: "#fff", borderRadius: "20px", padding: "22px", boxShadow: `0 2px 16px ${C.xNavy}0a, 0 8px 40px rgba(0,0,0,0.04)`, border: "1px solid rgba(0,0,0,0.04)", marginBottom: "14px" }}>

          {/* Quick select */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "#aab0bc", letterSpacing: "0.14em", marginBottom: "8px", textTransform: "uppercase", margin: "0 0 8px" }}>Popular Destinations</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {POPULAR.map(p => {
                const c = COUNTRIES.find(x => x.name === p.name);
                const active = selected?.name === p.name;
                const hasFta = c?.fta?.length > 0;
                return (
                  <button key={p.name} onClick={() => c && pick(c)} style={{
                    padding: "6px 11px", borderRadius: "8px",
                    border: active ? `2px solid ${C.xBlue}` : "1.5px solid #e8eaef",
                    background: active ? `linear-gradient(135deg, ${C.xBlue}08, ${C.xOrange}05)` : "#fff",
                    color: active ? C.xNavy : "#4b5563", fontSize: "12px", fontWeight: active ? 700 : 500,
                    cursor: "pointer", transition: "all 0.2s", outline: "none",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    <span style={{ fontSize: "13px" }}>{p.flag}</span>
                    <span>{p.short}</span>
                    {hasFta && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #e8eaef, transparent)", marginBottom: "16px" }} />

          {/* Country input */}
          <div style={{ marginBottom: "14px", position: "relative" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: C.xNavy, marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Destination Country</label>
            <div style={{ position: "relative" }}>
              <Globe size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: focused ? C.xBlue : "#bcc3d0", transition: "color 0.2s", pointerEvents: "none" }} />
              <input ref={inputRef} type="text" value={query} placeholder="Search country..." autoComplete="off"
                onFocus={() => { setFocused(true); if (query && !selected) setOpen(true); }}
                onBlur={() => setFocused(false)}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); if (selected && e.target.value !== selected.name) { setSelected(null); setShowFta(false); } }}
                style={{
                  width: "100%", padding: "12px 38px 12px 40px", borderRadius: "12px",
                  border: focused ? `2px solid ${C.xBlue}` : "1.5px solid #dfe3ea",
                  fontSize: "14px", outline: "none", background: focused ? "#fafbff" : "#fafafa",
                  transition: "all 0.2s", boxSizing: "border-box", color: "#111", fontWeight: 500,
                }}
              />
              {query && <button onClick={clear} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "#aaa", display: "flex" }}><X size={14} /></button>}
            </div>
            {open && filtered.length > 0 && (
              <div ref={dropRef} style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", borderRadius: "12px", border: "1.5px solid #dfe3ea", boxShadow: `0 12px 40px ${C.xNavy}18`, zIndex: 50, overflow: "hidden", maxHeight: "260px", overflowY: "auto" }}>
                {filtered.map((c, i) => (
                  <button key={c.name} onMouseDown={() => pick(c)} style={{
                    display: "flex", width: "100%", textAlign: "left", padding: "11px 16px",
                    background: "#fff", border: "none",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none",
                    cursor: "pointer", fontSize: "13px", color: "#111", transition: "background 0.12s",
                    alignItems: "center", justifyContent: "space-between", gap: "8px",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${C.xBlue}06`}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                      {c.fta?.length > 0 && <span style={{ fontSize: "9px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 6px", borderRadius: "4px" }}>FTA</span>}
                      <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 600 }}>
                        {c.threshold === 0 ? "$0" : `\u2264$${c.threshold}`}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── CURRENCY + VALUE ROW ── */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: C.xNavy, marginBottom: "5px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Order Value</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
              {/* Currency selector */}
              <div ref={currRef} style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={() => setShowCurr(!showCurr)} style={{
                  height: "100%", padding: "0 12px", borderRadius: "12px",
                  border: `1.5px solid ${showCurr ? C.xBlue : "#dfe3ea"}`,
                  background: showCurr ? "#fafbff" : "#fafafa",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                  transition: "all 0.2s", outline: "none", minWidth: "90px",
                }}>
                  <span style={{ fontSize: "15px" }}>{currency.flag}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: C.xNavy }}>{currency.code}</span>
                  <ChevronDown size={12} color="#9ca3af" style={{ transform: showCurr ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {showCurr && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0, width: "220px",
                    background: "#fff", borderRadius: "12px", border: "1.5px solid #dfe3ea",
                    boxShadow: `0 12px 40px ${C.xNavy}18`, zIndex: 60, overflow: "hidden",
                    maxHeight: "300px", overflowY: "auto",
                  }}>
                    {CURRENCIES.map((cur, i) => (
                      <button key={cur.code} onMouseDown={() => { setCurrency(cur); setShowCurr(false); }} style={{
                        display: "flex", width: "100%", textAlign: "left", padding: "10px 14px",
                        background: currency.code === cur.code ? `${C.xBlue}08` : "#fff",
                        border: "none", borderBottom: i < CURRENCIES.length - 1 ? "1px solid #f3f4f6" : "none",
                        cursor: "pointer", alignItems: "center", gap: "10px", transition: "background 0.12s",
                      }}
                        onMouseEnter={e => { if (currency.code !== cur.code) e.currentTarget.style.background = "#fafafa"; }}
                        onMouseLeave={e => { if (currency.code !== cur.code) e.currentTarget.style.background = "#fff"; }}>
                        <span style={{ fontSize: "16px" }}>{cur.flag}</span>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: C.xNavy }}>{cur.code}</span>
                          <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "6px" }}>{cur.name}</span>
                        </div>
                        {currency.code === cur.code && <CheckCircle size={14} color={C.xBlue} style={{ marginLeft: "auto" }} />}
                      </button>
                    ))}
                    {ratesLoading && <div style={{ padding: "10px 14px", fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "6px" }}><Loader size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading rates...</div>}
                    {ratesError && <div style={{ padding: "10px 14px", fontSize: "11px", color: C.ipRed }}>Could not fetch live rates. Using USD only.</div>}
                  </div>
                )}
              </div>

              {/* Value input */}
              <div style={{ position: "relative", flex: 1 }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", fontWeight: 700, color: value ? C.xOrange : "#bcc3d0", pointerEvents: "none", transition: "color 0.2s" }}>{currency.symbol}</span>
                <input ref={valRef} type="number" min="0" step="0.01" value={value} placeholder="0.00"
                  onChange={(e) => setValue(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px 12px 36px", borderRadius: "12px",
                    border: value ? `2px solid ${C.xOrange}` : "1.5px solid #dfe3ea",
                    fontSize: "14px", outline: "none", background: value ? "#fffcf8" : "#fafafa",
                    transition: "all 0.2s", boxSizing: "border-box", color: "#111", fontWeight: 500,
                  }}
                />
              </div>
            </div>
            {/* Conversion hint */}
            {currency.code !== "USD" && valueInUSD !== null && rates && (
              <div style={{ marginTop: "6px", fontSize: "11px", color: "#9ca3af", display: "flex", alignItems: "center", gap: "4px" }}>
                <RefreshCw size={10} />
                <span>{fmtCurr(value)} = <strong style={{ color: C.xNavy }}>{fmtUSD(valueInUSD)} USD</strong></span>
                <span style={{ marginLeft: "auto", fontSize: "10px", color: "#c0c0c0" }}>1 USD = {rates[currency.code]?.toFixed(2)} {currency.code}</span>
              </div>
            )}
          </div>

          {/* Pre-result */}
          {selected && !result && (
            <div style={{ background: `linear-gradient(135deg, ${C.xBlue}06, ${C.xOrange}04)`, borderRadius: "12px", padding: "14px 16px", display: "flex", gap: "10px", alignItems: "flex-start", border: `1px solid ${C.xBlue}15` }}>
              <Globe size={14} color={C.xBlue} style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: "13px", color: "#1f2937", fontWeight: 600 }}>
                  {selected.name} — Duty-free threshold:{" "}
                  <span style={{ color: selected.threshold === 0 ? C.ipRed : C.xBlue, fontWeight: 800 }}>
                    {selected.threshold === 0 ? "$0" : fmtUSD(selected.threshold)}
                  </span>
                </p>
                {selected.fta?.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                    {selected.fta.map(f => { const d = FTA_DATA[f]; return d ? <span key={f} style={{ fontSize: "9px", fontWeight: 700, color: d.color, background: `${d.color}0a`, padding: "2px 8px", borderRadius: "4px", border: `1px solid ${d.color}20` }}>{d.label}</span> : null; })}
                  </div>
                )}
                <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#9ca3af" }}>Enter order value to check</p>
              </div>
            </div>
          )}
        </div>

        {/* ── RESULT CARD ── */}
        {result && (
          <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: `0 2px 16px ${result.dutyFree ? "#22c55e" : C.ipRed}12, 0 8px 40px rgba(0,0,0,0.05)`, border: `2px solid ${result.dutyFree ? "#86efac" : "#fca5a5"}`, animation: "fadeUp 0.35s ease", marginBottom: "14px" }}>
            {/* Banner */}
            <div style={{
              background: result.dutyFree
                ? "linear-gradient(135deg, #15803d, #22c55e)"
                : `linear-gradient(135deg, ${C.ipRed}, ${C.xOrange})`,
              padding: "20px 22px", display: "flex", alignItems: "center", gap: "14px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
              {result.dutyFree ? <CheckCircle size={28} color="#fff" strokeWidth={2.5} /> : <AlertTriangle size={28} color="#fff" strokeWidth={2.5} />}
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.01em" }}>
                  {result.dutyFree ? "Duty-Free" : "Duty Likely"}
                </p>
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.9)", fontSize: "12px", fontWeight: 500 }}>
                  {result.dutyFree ? "Within duty-free threshold" : "Exceeds de minimis — customer may pay duty at delivery"}
                </p>
              </div>
            </div>

            <div style={{ padding: "22px" }}>
              {/* Comparison */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#f8f9fb", borderRadius: "14px", padding: "16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${C.xNavy}, ${C.xBlue})` }} />
                  <p style={{ margin: "6px 0 4px", fontSize: "9px", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Your Order</p>
                  <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: C.xNavy }}>{fmtUSD(result.v)}</p>
                  {currency.code !== "USD" && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" }}>{fmtCurr(result.inputVal)}</p>}
                </div>
                <div style={{ background: result.dutyFree ? "#f0fdf4" : "#fef2f2", borderRadius: "14px", padding: "16px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: result.dutyFree ? "linear-gradient(90deg, #15803d, #22c55e)" : `linear-gradient(90deg, ${C.ipRed}, ${C.xOrange})` }} />
                  <p style={{ margin: "6px 0 4px", fontSize: "9px", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Threshold</p>
                  <p style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: result.dutyFree ? "#15803d" : C.ipRed }}>
                    {selected.threshold === 0 ? "$0" : fmtUSD(selected.threshold)}
                  </p>
                </div>
              </div>

              {/* Destination */}
              <div style={{ background: "#f8f9fb", borderRadius: "12px", padding: "11px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>Destination</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: C.xNavy }}>{selected.name}</span>
              </div>

              {/* Message */}
              <div style={{
                borderRadius: "12px", padding: "16px",
                background: result.dutyFree ? "linear-gradient(135deg, #f0fdf4, #ecfdf5)" : "linear-gradient(135deg, #fef2f2, #fff1f2)",
                border: `1px solid ${result.dutyFree ? "#bbf7d0" : "#fecdd3"}`, marginBottom: "14px",
              }}>
                <p style={{ margin: 0, fontSize: "13px", color: result.dutyFree ? "#14532d" : "#881337", lineHeight: 1.7, fontWeight: 500 }}>
                  {result.dutyFree
                    ? `This order (${fmtUSD(result.v)}) is within ${selected.name}'s duty-free threshold of ${fmtUSD(selected.threshold)}. No customs duty expected.`
                    : selected.threshold === 0
                      ? `${selected.name} has no duty-free threshold. All imports are subject to customs duty. Customer will likely pay duty on this ${fmtUSD(result.v)} order at delivery.`
                      : `This order (${fmtUSD(result.v)}) exceeds ${selected.name}'s threshold of ${fmtUSD(selected.threshold)}. Customer may pay import duty at delivery.`
                  }
                </p>
              </div>

              {/* FTA */}
              {selected.fta?.length > 0 && (
                <div style={{ borderRadius: "12px", padding: "14px 16px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)", border: "1px solid #bbf7d0", marginBottom: "14px", cursor: "pointer" }} onClick={() => setShowFta(!showFta)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Shield size={14} color="#15803d" />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>India Trade Agreement Active</span>
                    </div>
                    <ChevronDown size={13} color="#15803d" style={{ transform: showFta ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                    {selected.fta.map(f => { const d = FTA_DATA[f]; return d ? <span key={f} style={{ fontSize: "9px", fontWeight: 700, color: d.color, background: "#fff", padding: "3px 8px", borderRadius: "5px", border: `1px solid ${d.color}20` }}>{d.label}</span> : null; })}
                  </div>
                  {showFta && (
                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #dcfce7" }}>
                      {selected.fta.map(f => { const d = FTA_DATA[f]; return d ? <p key={f} style={{ margin: "3px 0", fontSize: "12px", color: "#15803d", lineHeight: 1.5 }}>{d.desc}</p> : null; })}
                      <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#6b7280", fontStyle: "italic" }}>Preferential rates depend on HS code & Certificate of Origin.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              {selected.note && (
                <div style={{ borderRadius: "12px", padding: "14px 16px", background: `linear-gradient(135deg, ${C.xYellow}08, ${C.xOrange}05)`, border: `1px solid ${C.xYellow}40`, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Info size={13} color={C.xOrange} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: "12px", color: "#78350f", lineHeight: 1.7 }}>{selected.note}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!selected && !result && (
          <div style={{ textAlign: "center", padding: "36px 20px 24px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: `linear-gradient(135deg, ${C.xBlue}0c, ${C.xOrange}08)`, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${C.xBlue}10` }}>
              <Globe size={26} color={C.xBlue} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: C.xNavy, margin: "0 0 4px" }}>Select a destination</p>
            <p style={{ fontSize: "12px", lineHeight: 1.6, margin: 0, color: "#9ca3af" }}>
              Choose a country and enter order value to check the duty-free threshold
            </p>
            <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#9ca3af" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
              <span>Green dot = India FTA partner</span>
            </div>
          </div>
        )}

        {/* ── POLICY ALERT ── */}
        {showAlert && (
          <div style={{ background: `linear-gradient(135deg, ${C.xNavy}, ${C.xBlue}dd)`, borderRadius: "16px", padding: "18px 20px", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: `${C.xOrange}10` }} />
            <button onClick={() => setShowAlert(false)} style={{ position: "absolute", top: "12px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", display: "flex", padding: 0 }}><X size={14} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <AlertTriangle size={14} color={C.ipYellow} />
              <span style={{ fontSize: "10px", fontWeight: 800, color: C.ipYellow, letterSpacing: "0.08em" }}>2025–2026 GLOBAL POLICY CHANGES</span>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.75 }}>
              Multiple countries eliminated de minimis: <strong style={{ color: C.ipYellow }}>USA</strong> (Aug '25), <strong style={{ color: C.ipYellow }}>Mexico</strong> (Jan '25), <strong style={{ color: C.ipYellow }}>Vietnam</strong> (Feb '25), <strong style={{ color: C.ipYellow }}>Thailand</strong> (Jan '26), <strong style={{ color: C.ipYellow }}>Türkiye</strong> (Feb '26). EU introducing €3 flat duty on sub-€150 parcels from <strong style={{ color: C.ipYellow }}>July 2026</strong>.
            </p>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ marginTop: "24px", textAlign: "center", padding: "0 12px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "18px", height: "3px", borderRadius: "2px", background: `linear-gradient(90deg, ${C.xOrange}, ${C.xYellow})` }} />
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: C.xNavy }}>XINDUS TRADE NETWORKS</span>
            <div style={{ width: "18px", height: "3px", borderRadius: "2px", background: `linear-gradient(90deg, ${C.xBlue}, ${C.xNavy})` }} />
          </div>
          <p style={{ fontSize: "11px", color: "#9ca3af", lineHeight: 1.8, margin: "0 0 4px" }}>
            VAT/GST is usually prepaid. Duty (if applicable) is paid by the customer at delivery.
          </p>
          <p style={{ fontSize: "10px", color: "#c0c0c0", margin: "0 0 4px" }}>
            FTA benefits require Certificate of Origin. Thresholds in USD (approximate conversion). Always verify with official customs authorities.
          </p>
          <p style={{ fontSize: "9px", color: "#d4d4d8", margin: 0 }}>
            Last verified: March 2026 · Sources: WTO, DGFT, CBIC, national customs authorities
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
        * { box-sizing: border-box; }
        ::selection { background: ${C.xBlue}30; }
      `}</style>
    </div>
  );
}