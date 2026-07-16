import { GlassCard } from "./GlassCard";

interface PuntosPreview {
  tipo: "PUNTOS";
  nombrePrograma: string;
  logoUrl: string | null;
  colorAcento: string;
  nombreCliente: string;
  puntos: number;
  nivelLabel: string;
  porcentaje: number;
  notaProgreso: string;
}

interface EstampitasPreview {
  tipo: "ESTAMPITAS";
  nombrePrograma: string;
  logoUrl: string | null;
  colorAcento: string;
  totalEstampitas: number;
  estampitasLlenas: number;
  premioDescripcion: string;
}

type Props = PuntosPreview | EstampitasPreview;

// Tarjeta principal que ve el cliente en /mi-tarjeta — se usa también en la vista
// previa del diseñador para que el admin vea exactamente lo que va a publicar.
export function WalletCardPreview(props: Props) {
  return (
    <div>
      <div className="text-center pb-3">
        {props.logoUrl ? (
          <div className="inline-flex items-center justify-center bg-white rounded-2xl px-6 py-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.logoUrl} alt={props.nombrePrograma} className="h-6 object-contain" />
          </div>
        ) : (
          <p className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
            {props.nombrePrograma}
          </p>
        )}
      </div>

      <GlassCard>
        <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
          {props.nombrePrograma}
        </p>

        {props.tipo === "PUNTOS" ? (
          <>
            <h1 className="text-xl font-bold mt-1 text-white">{props.nombreCliente}</h1>
            <div className="flex items-end justify-between mt-6">
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Puntos disponibles
                </p>
                <p className="text-4xl font-bold text-white mt-1">{props.puntos}</p>
              </div>
              <span
                className="inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {props.nivelLabel}
              </span>
            </div>
            <div className="mt-5">
              <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${props.porcentaje}%`, background: props.colorAcento }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                {props.notaProgreso}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Premio: {props.premioDescripcion}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {Array.from({ length: props.totalEstampitas }).map((_, i) => (
                <span
                  key={i}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={
                    i < props.estampitasLlenas
                      ? { background: props.colorAcento, color: "#fff" }
                      : { border: "2px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.2)" }
                  }
                >
                  {i < props.estampitasLlenas ? "✓" : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}
