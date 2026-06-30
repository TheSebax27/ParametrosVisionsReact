type Props = { seccion: string; setSeccion: (s: string) => void };

export default function Header({ seccion, setSeccion }: Props) {
  const tabs = [
    { id: "formulario", label: "➕ Nuevo" },
    { id: "tabla", label: "📋 Registros" },
    { id: "buscar", label: "🔍 Buscar" },
    //{ id: "ip", label: "🌍 Ip's" },
  ];
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <img src="/icons/logo.png" alt="Logo" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
          <span className="logo-text">AYUDA <strong>VISIONS</strong></span>
        </div>
        <nav className="nav">
          {tabs.map((t) => (
            <button key={t.id} className={`nav-btn ${seccion === t.id ? "activo" : ""}`} onClick={() => setSeccion(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}