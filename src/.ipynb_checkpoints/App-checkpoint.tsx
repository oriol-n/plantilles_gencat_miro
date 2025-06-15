
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

type FrameInfo = {
  id: string;
  title: string;
  fase: number;
  index: number;
  thumbnail: string;
  items: any[];
};

function App() {
  const [frames, setFrames] = useState<FrameInfo[]>([]);
  const [frameSeleccionat, setFrameSeleccionat] = useState<FrameInfo | null>(null);
  const [sessioSeleccionada, setSessioSeleccionada] = useState("totes");
  const [termeCerca, setTermeCerca] = useState("");
  const [menuObert, setMenuObert] = useState(false);
  const [cercaActiva, setCercaActiva] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
   importarFrames(setFrames, setFrameSeleccionat);
      setCercaActiva(true);
  }, []);

  useEffect(() => {
    if (frameSeleccionat) {
      document.body.style.cursor = "crosshair";
      alert("Has seleccionat un frame. Ara fes clic a 'Ubica el frame seleccionat aquí' per col·locar-lo.");
    } else {
      document.body.style.cursor = "default";
    }

    return () => {
      document.body.style.cursor = "default";
    };
  }, [frameSeleccionat]);

  const framesFiltrats = frames.filter((frame) => {
    const coincideixSessio = sessioSeleccionada === "totes" || frame.fase.toString() === sessioSeleccionada;
    const coincideixCerca = termeCerca.trim() === "" || frame.title.toLowerCase().includes(termeCerca.toLowerCase());
    return coincideixSessio && coincideixCerca;
  });

  const suggeriments = [...new Set(
    frames
      .map((f) => f.title)
      .filter((t) => termeCerca && t.toLowerCase().includes(termeCerca.toLowerCase()))
  )].slice(0, 5);

  return (
    <div style={{ padding: "1rem" }}>
      {/* Capçalera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingTop: "0.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", margin: "0" }}>Plantilles gencat</h1>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenuObert(!menuObert)}
            title="Configuració"
            style={{ fontSize: "1.2rem", background: "none", border: "none", cursor: "pointer" }}
          >
            ⚙️
          </button>

          {menuObert && (
            <div
              style={{
                position: "absolute",
                top: "2rem",
                right: 0,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                zIndex: 10,
                padding: "0.5rem",
                minWidth: "120px",
              }}
            >
              <button
                onClick={() => {
                  importarFrames(setFrames, setFrameSeleccionat);
                  setMenuObert(false);
                }}
              >
                📥 Importar
              </button>
              <button
                onClick={() => {
                  exportarFrames(frames);
                  setMenuObert(false);
                }}
              >
                📤 Exportar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
<div style={{ marginBottom: "1rem" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
    <label htmlFor="sessio-filter">Sessió:</label>
    <select
      id="sessio-filter"
      value={sessioSeleccionada}
      onChange={(e) => setSessioSeleccionada(e.target.value)}
    >
      <option value="totes">Totes</option>
      <option value="1">1 - Comprensió</option>
      <option value="2">2 - Redefinició</option>
      <option value="3">3 - Ideació</option>
      <option value="4">4 - Prototip</option>
      <option value="5">5 - Validació</option>
    </select>
  </div>

  <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
    <label htmlFor="input-cerca">Cerca:</label>
    <input
      id="input-cerca"
      type="text"
      placeholder="Cerca per títol..."
      value={termeCerca}
      onChange={(e) => setTermeCerca(e.target.value)}
      style={{
        padding: "0.25rem",
        fontSize: "0.9rem",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        width: "200px",
      }}
      list="suggeriments"
    />
    <datalist id="suggeriments">
      {suggeriments.map((titol, idx) => (
        <option key={idx} value={titol} />
      ))}
    </datalist>
  </div>
</div>


      {/* Contingut */}
      {frames.length === 0 ? (
        <p>No hi ha cap frame carregat. Fes clic a "Importar plantilles" per començar.</p>
      ) : (
        <div
          id="thumbnails-container"
          ref={thumbnailsRef}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "1rem",
            maxHeight: "80vh",
            overflowY: "auto",
            paddingRight: "0.5rem",
          }}
        >
          {framesFiltrats.length === 0 ? (
            <p>No s'ha trobat la paraula cercada.</p>
          ) : (
            framesFiltrats.map((frame) => (
              <div
                key={`${frame.fase}-${frame.index}`}
onClick={async () => {
  const offsetX = 10000;
  const offsetY = 0;

  await copiarFrame(
    { ...frame, x: (frame.x ?? 0) + offsetX, y: (frame.y ?? 0) + offsetY },
    frames
  );
}}


                style={{
                  width: "200px",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
                  borderRadius: "4px",
                  padding: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.backgroundColor = "#f9f9f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <img
                  src={`/thumbnails/${frame.fase}.${frame.index}.jpg`}
                  alt={frame.title}
                  style={{
                    height: "100px",
                    width: "auto",
                    maxWidth: "200px",
                    objectFit: "cover",
                    display: "block",
                    marginBottom: "0.25em",
                    border: "0px solid #ccc",
                  }}
                />
                <div style={{ fontSize: "0.8rem", textAlign: "left" }}>{frame.title}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Fora del component
async function importarFrames(setFrames, setFrameSeleccionat) {
  try {
    console.log("📥 Iniciant importació de plantilles amb coordenades relatives...");

    const response = await fetch(`/plantilles.json?nocache=${Date.now()}`);
    if (!response.ok) throw new Error("No s'ha pogut carregar plantilles.json");

    const data = await response.json();
    const framesValids = [];

    for (let i = 0; i < data.length; i++) {
      const frame = data[i];

      if (!frame || !Array.isArray(frame.items)) {
        console.warn("⚠️ Frame invàlid o sense ítems:", frame);
        continue;
      }

      const items = frame.items
        .filter((item) =>
          item?.type &&
          isFinite(item.xRel) &&
          isFinite(item.yRel) &&
          isFinite(item.width) &&
          isFinite(item.height)
        )
        .map((item) => ({
          ...item,
          x: frame.x - frame.width / 2 + item.xRel,
          y: frame.y - frame.height / 2 + item.yRel,
          id: undefined,
          parentId: undefined,
          style: item.style ?? {},
          metadata: item.metadata ?? {},
          ordre: item.ordre ?? 0,
          shape: item.shape ?? (item.type === "sticky_note" ? "square" : undefined),
        }));

      let fase = 0;
      let index = 0;
      let titleOriginal = frame.title ?? "";
      let titleNetejat = titleOriginal;

      const match = titleOriginal.match(/^(\d+)\.(\d+)[\s\-]*(.*)$/);
      if (match) {
        fase = parseInt(match[1], 10);
        index = parseInt(match[2], 10);
        titleNetejat = match[3].trim().replace(/^\-+|\-+$/g, "").replace(/\s+/g, " ");
      } else {
        console.warn(`⚠️ Títol amb format inesperat: "${titleOriginal}". Assignant valors per defecte.`);
        fase = Math.floor(i / 10) + 1;
        index = i % 10;
        titleNetejat = titleOriginal.trim();
      }

      const titleFinal = `${fase}.${index} - ${titleNetejat}`;

      framesValids.push({
        id: undefined,
        fase,
        index,
        title: titleFinal,
        x: typeof frame.x === "number" ? frame.x : 0,
        y: typeof frame.y === "number" ? frame.y : 0,
        width: typeof frame.width === "number" ? frame.width : undefined,
        height: typeof frame.height === "number" ? frame.height : undefined,
        style: frame.style ?? {},
        thumbnail: frame.thumbnail ?? "",
        items,
      });

      console.log(`✅ Frame "${titleFinal}" assignat a fase ${fase}, index ${index}`);
    }

    framesValids.sort((a, b) => a.fase - b.fase || a.index - b.index);
    setFrames(framesValids);
    setFrameSeleccionat(null);

    console.log(`📦 Importació finalitzada. Total frames carregats: ${framesValids.length}`);
  } catch (error) {
    console.error("❌ Error important frames:", error);
    alert("Hi ha hagut un error important les miniatures.");
  }
}












function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exportarFrames(frames) {
  try {
    console.log("📤 Iniciant exportació de frames amb coordenades relatives...");

    const allFrames = await miro.board.get({ type: "frame" });
    const allItems = await miro.board.get();
    const framesExportats = [];

    for (const frame of allFrames) {
      const itemsPerParent = allItems.filter((item) => item.parentId === frame.id);
      let itemsDelFrame = itemsPerParent;

      if (itemsDelFrame.length === 0) {
        const frameLeft = frame.x - frame.width / 2;
        const frameRight = frame.x + frame.width / 2;
        const frameTop = frame.y - frame.height / 2;
        const frameBottom = frame.y + frame.height / 2;

        itemsDelFrame = allItems.filter((item) => {
          const x = item.x ?? 0;
          const y = item.y ?? 0;
          return x >= frameLeft && x <= frameRight && y >= frameTop && y <= frameBottom;
        });
      }

      const enrichedItems = [];

      for (const item of itemsDelFrame) {
        try {
          const fullItem = await miro.board.getById(item.id);
          if (!fullItem || fullItem.type === "image" || !isFinite(fullItem.x) || !isFinite(fullItem.y) || !isFinite(fullItem.width) || !isFinite(fullItem.height)) continue;

          const relativeX = fullItem.x - (frame.x - frame.width / 2);
          const relativeY = fullItem.y - (frame.y - frame.height / 2);

          enrichedItems.push({
            id: fullItem.id,
            type: fullItem.type,
            xRel: relativeX,
            yRel: relativeY,
            content: fullItem.content,
            width: fullItem.width,
            height: fullItem.height,
            rotation: fullItem.rotation,
            style: fullItem.style ?? {},
            metadata: fullItem.metadata ?? {},
            ordre: 0,
            shape: fullItem.shape,
            scale: fullItem.scale,
            title: fullItem.title,
          });
        } catch (e) {
          console.warn("❌ No s'ha pogut llegir l'ítem:", item.id, e);
        }

        await sleep(100);
      }

      framesExportats.push({
        id: frame.id,
        title: frame.title,
        fase: 0,
        index: 0,
        thumbnail: "",
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        style: frame.style ?? {},
        items: enrichedItems,
      });

      await sleep(500);
    }

    const dataStr = JSON.stringify(framesExportats, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilles.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.log("✅ Exportació completada amb èxit.");
  } catch (error) {
    console.error("❌ Error exportant frames:", error);
    alert("Hi ha hagut un error exportant les plantilles.");
  }
}



















async function copiarFrame(frameSeleccionat, frames) {
  const frameCopiat = trobarFrameCopiat(frameSeleccionat, frames);
  if (!frameCopiat) return;

  if (!validarItemsDelFrame(frameCopiat)) return;

  try {
    for (const item of frameCopiat.items) {
      const xRel = Number(item.xRel);
      const yRel = Number(item.yRel);
      const frameX = Number(frameCopiat.x);
      const frameY = Number(frameCopiat.y);
      const frameW = Number(frameCopiat.width);
      const frameH = Number(frameCopiat.height);

      console.log("🧪 Verificant càlcul de coordenades per item:");
      console.log("  item.id:", item.id ?? "sense id");
      console.log("  xRel:", xRel, "yRel:", yRel);
      console.log("  frame.x:", frameX, "frame.y:", frameY);
      console.log("  frame.width:", frameW, "frame.height:", frameH);
      console.log("  isFinite(xRel):", isFinite(xRel), "isFinite(yRel):", isFinite(yRel));
      console.log("  isFinite(frameW):", isFinite(frameW), "isFinite(frameH):", isFinite(frameH));

      if (!isFinite(xRel) || !isFinite(yRel) || !isFinite(frameW) || !isFinite(frameH)) {
        console.warn("❌ Valors no vàlids per calcular coordenades:", {
          item,
          xRel,
          yRel,
          frameW,
          frameH,
        });
        continue;
      }

      item.x = frameX - frameW / 2 + xRel;
      item.y = frameY - frameH / 2 + yRel;
    }

    const tipusSuportats = ["sticky_note", "text", "shape"];
    const itemsValids = frameCopiat.items
      .filter((item) =>
        tipusSuportats.includes(item.type) &&
        isFinite(item.x) &&
        isFinite(item.y) &&
        isFinite(item.width) &&
        isFinite(item.height)
      )
      .map((item) => structuredClone(item));

    if (itemsValids.length === 0) {
      alert("No s'han trobat ítems vàlids per copiar dins del frame.");
      return;
    }

    const boundsOriginal = calcularBoundingBox(itemsValids);
    if (!isFinite(boundsOriginal.minX) || !isFinite(boundsOriginal.width)) {
      alert("Error: bounding box invàlid.");
      return;
    }

    const frameX = isFinite(frameSeleccionat.x) ? Number(frameSeleccionat.x) : 0;
    const frameY = isFinite(frameSeleccionat.y) ? Number(frameSeleccionat.y) : 0;

    const createdFrame = await miro.board.createFrame({
      title: frameCopiat.title,
      x: frameX,
      y: frameY,
      width: boundsOriginal.width,
      height: boundsOriginal.height,
      style: {
        fillColor: frameCopiat.style?.fillColor ?? "#ffffff",
      },
    });

    await sleep(100);
    const fullFrame = await miro.board.getById(createdFrame.id);

    let totalFallits = 0;

    const creationPromises = frameCopiat.items.map(async (item) => {
console.log("📍 Abans de calcular itemY:");
console.log("  item.x:", item.x, "item.y:", item.y);
console.log("  boundsOriginal.minX:", boundsOriginal.minX, "minY:", boundsOriginal.minY);
console.log("  frameX:", frameX, "frameY:", frameY);
console.log("  boundsOriginal.width:", boundsOriginal.width, "height:", boundsOriginal.height);

const itemX = Number(item.x) - boundsOriginal.minX + (frameX - boundsOriginal.width / 2);
const itemY = Number(item.y) - boundsOriginal.minY + (frameY - boundsOriginal.height / 2);


      console.log("📌 Comparació itemX vs itemY:");
      console.log({
        itemId: item.id ?? "sense id",
        itemX,
        itemY,
        itemX_isValid: isFinite(itemX),
        itemY_isValid: isFinite(itemY),
        originalX: item.x,
        originalY: item.y,
        boundsOriginal,
      });

      if (!isFinite(itemX) || !isFinite(itemY)) {
        console.warn("❌ Coordenades NaN detectades abans de crear props:", {
          item,
          itemX,
          itemY,
          itemHeight: item.height,
          boundsHeight: boundsOriginal.height,
        });
        totalFallits++;
        return null;
      }

      const props = getCreateProps(item, itemX, itemY);
      if (!props) {
        totalFallits++;
        return null;
      }

      try {
        const newItem = await createItem(item.type, props);
        await fullFrame.add(newItem);
        await sleep(200);
        await applyExtraProps(newItem, item);
        return newItem;
      } catch (error) {
        console.warn("⚠️ Error creant ítem:", item, error);
        totalFallits++;
        return null;
      }
    });

    const itemsCreats = (await Promise.all(creationPromises)).filter(Boolean);
    const totalCreats = itemsCreats.length;

    const missatge = `📦 Resum de la còpia del frame "${frameCopiat.title}":\n✅ Ítems creats: ${totalCreats}\n❌ Ítems amb errors: ${totalFallits}`;
    console.log(missatge);
    alert(missatge);

    await miro.board.viewport.zoomTo(fullFrame);
  } catch (error) {
    console.error("❌ Error creant el frame:", error);
    alert("Error creant el frame al board: " + error.message);
  }
}



































function trobarFrameCopiat(frameSeleccionat: any, frames: any[]): any | null {
  const frame = frames.find(
    (f) => f.fase === frameSeleccionat.fase && f.index === frameSeleccionat.index
  );

  if (!frame) {
    console.error("No s'ha trobat el frame corresponent:", frameSeleccionat);
    alert("No s'ha trobat el frame corresponent.");
    return null;
  }

  return frame;
}




function getCreateProps(item, x, y) {
  const baseProps = {
    x,
    y,
    ...(typeof item.rotation === "number" ? { rotation: item.rotation } : {}),
  };

  const style = item.style && typeof item.style === "object" ? { ...item.style } : {};

  switch (item.type) {
    case "sticky_note":
      if (!item.content) {
        console.warn("❌ Sticky note sense content:", item);
        return null;
      }
      return {
        ...baseProps,
        content: item.content,
        shape: typeof item.shape === "string" ? item.shape : "square",
        ...(isFinite(item.width) ? { width: item.width } : {}),
        ...(isFinite(item.height) ? { height: item.height } : {}),
        style,
      };

    case "text":
      if (!item.content) {
        console.warn("❌ Text sense content:", item);
        return null;
      }
      return {
        ...baseProps,
        content: item.content,
        ...(isFinite(item.width) ? { width: item.width } : {}),
        style,
      };

    case "shape":
      return {
        ...baseProps,
        content: item.content ?? "",
        shape: typeof item.shape === "string" ? item.shape : "rectangle",
        ...(isFinite(item.width) ? { width: item.width } : {}),
        ...(isFinite(item.height) ? { height: item.height } : {}),
        style,
      };

    case "image":
      if (!item.url || (!item.url.startsWith("http") && !item.url.startsWith("data:image/"))) {
        console.warn("❌ Imatge amb URL no vàlida:", item);
        return null;
      }
      return {
        ...baseProps,
        url: item.url,
        ...(isFinite(item.width) ? { width: item.width } : {}),
        ...(isFinite(item.height) ? { height: item.height } : {}),
        ...(isFinite(item.scale) ? { scale: item.scale } : {}),
      };

    default:
      console.warn(`❌ Tipus d'ítem no suportat: ${item.type}`, item);
      return null;
  }
}






async function createItem(type: string, props: any): Promise<any> {
  try {
    switch (type) {
      case "sticky_note":
        return await miro.board.createStickyNote(props);

      case "text":
        return await miro.board.createText(props);

      case "shape":
        return await miro.board.createShape(props);

      case "image":
        if (!props.url || (!props.url.startsWith("http") && !props.url.startsWith("data:image/"))) {
          throw new Error("URL d'imatge no vàlida o inexistent");
        }
        return await miro.board.createImage(props);

      case "frame":
        return await miro.board.createFrame(props);

      default:
        throw new Error(`Tipus d'ítem no suportat: ${type}`);
    }
  } catch (error) {
    console.error(`Error creant ítem de tipus ${type}:`, error);
    throw error;
  }
}


const updateWarningsShown = new Set();
const DEBUG_EXTRA_PROPS = false; // 🔧 Activa per veure què s'intenta aplicar
async function applyExtraProps(newItem, originalItem) {
  if (!newItem || !newItem.id || !newItem.type) {
    console.warn("Ítem nou invàlid:", newItem);
    return;
  }

  const validUpdatePropsByType = {
    sticky_note: ["style", "rotation", "metadata"],
    image: ["style", "rotation", "metadata", "scale", "width", "height"],
    frame: ["style", "rotation", "metadata", "width", "height", "title"],
    // text i shape no s'inclouen perquè donen errors
  };

  const allowedProps = validUpdatePropsByType[newItem.type] || [];
  const extraProps = {};

  for (const prop of allowedProps) {
    const value = originalItem[prop];
    if (value !== undefined && value !== null) {
      extraProps[prop] = value;
    }
  }

  if (Object.keys(extraProps).length === 0) return;

  try {
    if (typeof newItem.update === "function") {
      await newItem.update(extraProps);
      console.log(`✅ Propietats extra aplicades a ${newItem.type}:`, extraProps);
    } else {
      console.warn(`⚠️ ${newItem.type} no suporta update():`, newItem);
    }
  } catch (error) {
    console.error(`❌ Error aplicant update() a ${newItem.type}:`, error);
  }
}








function calcularBoundingBox(items) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const item of items) {
    const x = Number(item.x);
    const y = Number(item.y);
    const width = Number(item.width);
    const height = Number(item.height);

    if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
      console.warn("⚠️ Ítem amb valors no vàlids al bounding box:", item);
      continue;
    }

    const left = x - width / 2;
    const right = x + width / 2;
    const top = y - height / 2;
    const bottom = y + height / 2;

    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  }

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    console.error("❌ Bounding box conté valors no vàlids. Retornant valors per defecte.");
    return {
      minX: 0,
      minY: 0,
      centerY: 0,
      width: 1000,
      height: 1000,
    };
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const centerY = (minY + maxY) / 2;

  return { minX, minY, centerY, width, height };
}






function validarItemsDelFrame(frame) {
  const errors = [];

  for (const item of frame.items) {
    const problemes = [];

    const xRel = Number(item.xRel);
    const yRel = Number(item.yRel);
    const width = Number(item.width);
    const height = Number(item.height);

    if (!isFinite(xRel)) problemes.push("xRel no vàlid");
    if (!isFinite(yRel)) problemes.push("yRel no vàlid");
    if (!isFinite(width)) problemes.push("width no vàlid");
    if (!isFinite(height)) problemes.push("height no vàlid");

    if (!isFinite(frame.x)) problemes.push("frame.x no vàlid");
    if (!isFinite(frame.y)) problemes.push("frame.y no vàlid");
    if (!isFinite(frame.width)) problemes.push("frame.width no vàlid");
    if (!isFinite(frame.height)) problemes.push("frame.height no vàlid");

    if (problemes.length > 0) {
      errors.push({
        itemId: item.id,
        type: item.type,
        problemes,
        item,
      });
    }
  }

  if (errors.length > 0) {
    console.group("❌ Validació d'ítems fallida:");
    errors.forEach((e, i) => {
      console.warn(`Ítem ${i + 1}:`, e.problemes.join(", "), e.item);
    });
    console.groupEnd();
    alert(`S'han detectat ${errors.length} ítems amb valors invàlids. Consulta la consola per veure els detalls.`);
    return false;
  }

  console.log("✅ Tots els ítems del frame són vàlids.");
  return true;
}









const root = document.getElementById("root");
if (root) {
  ReactDOM.render(<App />, root);
}
