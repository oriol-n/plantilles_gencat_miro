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
    importFrames(setFrames, setFrameSeleccionat);
    setCercaActiva(true);
  }, []);

  useEffect(() => {
    if (frameSeleccionat) {
      document.body.style.cursor = "crosshair";
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
      .filter((t) => typeof t === "string" && termeCerca && t.toLowerCase().includes(termeCerca.toLowerCase()))
  )].slice(0, 5);

  return (
    <div style={{ padding: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingTop: "0.5rem" }}>
        <h1 style={{ fontSize: "1.2rem", margin: "0" }}>Plantilles Generalitat</h1>

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
                  importFrames(setFrames, setFrameSeleccionat);
                  setMenuObert(false);
                }}
              >
                📥 Importar
              </button>
              <button
                onClick={async () => {
                  await exportFrames(frames);
                  setMenuObert(false);
                }}
              >
                📤 Exportar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
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

        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="input-cerca" style={{ marginBottom: 0 }}>Cerca:</label>
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
              width: "120px",
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

      {/* Content */}
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

                  await copyFrame(
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

// --- Utility functions ---
// (Place these after the App component)

// Imports frames from plantilles.json and saves them to state
async function importFrames(setFrames: (frames: any[]) => void, setFrameSeleccionat: (f: any) => void) {
  try {
    console.log("📥 Starting import of templates with relative coordinates...");

    const response = await fetch(`/plantilles.json?nocache=${Date.now()}`);
    if (!response.ok) throw new Error("Failed to load plantilles.json");

    const data = await response.json();
    const framesValids = [];

    for (let i = 0; i < data.length; i++) {
      const frame = data[i];

      if (!frame || !Array.isArray(frame.items)) {
        console.warn("⚠️ Invalid frame or missing items:", frame);
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
        console.warn(`⚠️ Unexpected title format: "${titleOriginal}". Assigning default values.`);
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

      console.log(`✅ Frame "${titleFinal}" assigned to phase ${fase}, index ${index}`);
    }

    framesValids.sort((a, b) => a.fase - b.fase || a.index - b.index);
    setFrames(framesValids);
    setFrameSeleccionat(null);

    console.log(`📦 Import finished. Total frames loaded: ${framesValids.length}`);
  } catch (error) {
    console.error("❌ Error importing frames:", error);
  }
}

// Exports frames from the board to a JSON file
async function exportFrames(frames: any[]): Promise<void> {
  try {
    console.log("📤 Starting export of frames with relative coordinates...");

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

      // For each item in itemsDelFrame
      for (let i = 0; i < itemsDelFrame.length; i++) {
        const item = itemsDelFrame[i];
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
            ordre: i,
            shape: fullItem.shape,
            scale: fullItem.scale,
            title: fullItem.title,
            emoji: fullItem.emoji,
          });
        } catch (e) {
          console.warn("❌ Could not read item:", item.id, e);
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
    console.log("✅ Export completed successfully.");
  } catch (error) {
    console.error("❌ Error exporting frames:", error);
  }
}

// Copies a selected frame to the board
async function copyFrame(frameSeleccionat: any, frames: any[]): Promise<void> {
  const frameCopiat = findCopiedFrame(frameSeleccionat, frames);
  if (!frameCopiat) return;

  if (!validateFrameItems(frameCopiat)) return;

  try {
    for (const item of frameCopiat.items) {
      const xRel = Number(item.xRel);
      const yRel = Number(item.yRel);
      const frameX = Number(frameCopiat.x);
      const frameY = Number(frameCopiat.y);
      const frameW = Number(frameCopiat.width);
      const frameH = Number(frameCopiat.height);

      if (!isFinite(xRel) || !isFinite(yRel) || !isFinite(frameW) || !isFinite(frameH)) {
        continue;
      }

      item.x = frameX - frameW / 2 + xRel;
      item.y = frameY - frameH / 2 + yRel;
    }

    const tipusSuportats = ["sticky_note", "text", "shape"];
    // --- ORDER: text at the end ---
    const itemsValids = frameCopiat.items
      .filter((item) =>
        tipusSuportats.includes(item.type) &&
        isFinite(item.x) &&
        isFinite(item.y) &&
        isFinite(item.width) &&
        isFinite(item.height)
      )
      .map((item) => structuredClone(item))
      .sort((a, b) => (b.ordre ?? 0) - (a.ordre ?? 0)); // Reverse order for z-index

    if (itemsValids.length === 0) {
      console.log("No valid items found to copy inside the frame.");
      return;
    }

    const boundsOriginal = calcularBoundingBox(itemsValids);
    if (!isFinite(boundsOriginal.minX) || !isFinite(boundsOriginal.width)) {
      console.log("Error: invalid bounding box.");
      return;
    }

    const frameX = isFinite(frameSeleccionat.x) ? Number(frameSeleccionat.x) : 0;
    const frameY = isFinite(frameSeleccionat.y) ? Number(frameSeleccionat.y) : 0;

    const createdFrame = await miro.board.createFrame({
      title: frameCopiat.title,
      x: frameX,
      y: frameY,
      width: frameCopiat.width,
      height: frameCopiat.height,
      style: {
        fillColor: frameCopiat.style?.fillColor ?? "#ffffff",
      },
    });

    console.log(
      "[copyFrame] Frame JSON width/height:",
      frameCopiat.width,
      frameCopiat.height
    );
    console.log(
      "[copyFrame] Created frame width/height:",
      createdFrame.width,
      createdFrame.height
    );

    await sleep(100);
    const fullFrame = await miro.board.getById(createdFrame.id);
    console.log(
      "[copyFrame] Retrieved frame width/height:",
      fullFrame.width,
      fullFrame.height
    );

    let totalFallits = 0;

    await new Promise(r => setTimeout(r, 1500)); // Wait 1.5 seconds before adding items

    const margin = 4;
    const creationPromises = itemsValids.map(async (item) => {
      const itemX = Number(item.x) - boundsOriginal.minX + (frameX - frameCopiat.width / 2) + margin;
      const itemY = Number(item.y) - boundsOriginal.minY + (frameY - frameCopiat.height / 2) + margin;

      if (!isFinite(itemX) || !isFinite(itemY)) {
        totalFallits++;
        return null;
      }

      // Do not add parentId here!
      const props = getCreateProps(item, itemX, itemY);
      if (!props) {
        totalFallits++;
        return null;
      }

      try {
        const newItem = await createItem(item.type, props);
        console.log("Before adding, parentId:", newItem.parentId);
        await fullFrame.add(newItem);
        await sleep(200);
        const refreshed = await miro.board.getById(newItem.id);
        console.log("After adding, parentId:", refreshed.parentId);
        await applyExtraProps(newItem, item);
        return newItem;
      } catch (error) {
        totalFallits++;
        return null;
      }
    });

    const itemsCreats = (await Promise.all(creationPromises)).filter(Boolean);
    const totalCreats = itemsCreats.length;

    const message = `📦 Frame copy summary "${frameCopiat.title}":\n✅ Items created: ${totalCreats}\n❌ Items with errors: ${totalFallits}`;
    console.log(message);

    await miro.board.viewport.zoomTo(fullFrame);
  } catch (error) {
    console.error("❌ Error creating frame:", error);
  }
}

// Finds the copied frame based on the selection
function findCopiedFrame(frameSeleccionat: any, frames: any[]): any | null {
  const frame = frames.find(
    (f) => f.fase === frameSeleccionat.fase && f.index === frameSeleccionat.index
  );

  if (!frame) {
    console.error("Corresponding frame not found:", frameSeleccionat);
    return null;
  }

  return frame;
}

// Generates the properties to create an item in Miro
function getCreateProps(item: any, x: number, y: number): any {
  const baseProps = {
    x,
    y,
    ...(typeof item.rotation === "number" ? { rotation: item.rotation } : {}),
  };

  const style = item.style && typeof item.style === "object" ? { ...item.style } : {};

  switch (item.type) {
    case "sticky_note": {
      // Only one of the two properties: width or height
      let sizeProps = {};
      if (isFinite(item.width)) sizeProps.width = item.width;
      else if (isFinite(item.height)) sizeProps.height = item.height;

      return {
        ...baseProps,
        content: typeof item.content === "string" ? item.content : "",
        shape: typeof item.shape === "string" ? item.shape : "square",
        ...sizeProps,
        style,
      };
    }

    case "text":
      if (!item.content) {
        console.warn("❌ Text without content:", item);
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
        console.warn("❌ Image with invalid URL:", item);
        return null;
      }
      return {
        ...baseProps,
        url: item.url,
        ...(isFinite(item.width) ? { width: item.width } : {}),
        ...(isFinite(item.height) ? { height: item.height } : {}),
        ...(isFinite(item.scale) ? { scale: item.scale } : {}),
      };

    case "emoji":
      return {
        ...baseProps,
        emoji: item.emoji,
        ...(isFinite(item.width) ? { width: item.width } : {}),
        ...(isFinite(item.height) ? { height: item.height } : {}),
        style,
      };

    default:
      console.warn(`❌ Unsupported item type: ${item.type}`, item);
      return null;
  }
}

// Creates an item on the board according to its type
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
          throw new Error("Invalid or missing image URL");
        }
        return await miro.board.createImage(props);

      case "frame":
        return await miro.board.createFrame(props);

      case "emoji":
        return await miro.board.createEmoji(props);

      default:
        throw new Error(`Unsupported item type: ${type}`);
    }
  } catch (error) {
    console.error(`Error creating item of type ${type}:`, error);
    throw error;
  }
}

// Applies extra properties to an item (only if the type supports it)
const updateWarningsShown = new Set();
const DEBUG_EXTRA_PROPS = false; // Enable to see what is being applied
async function applyExtraProps(newItem: any, originalItem: any): Promise<void> {
  if (!newItem || !newItem.id || !newItem.type) {
    console.warn("Invalid new item:", newItem);
    return;
  }

  // Only attempt update if the type actually supports it
  const validUpdatePropsByType = {
    image: ["style", "rotation", "metadata", "scale", "width", "height"],
    frame: ["style", "rotation", "metadata", "width", "height", "title"],
    // sticky_note, text and shape do NOT support update()
  };

  const allowedProps = validUpdatePropsByType[newItem.type] || [];
  if (allowedProps.length === 0) {
    // Do not show warning, just return silently
    return;
  }

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
      console.log(`✅ Extra properties applied to ${newItem.type}:`, extraProps);
    }
  } catch (error) {
    console.error(`❌ Error applying update() to ${newItem.type}:`, error);
  }
}

// Calculates the bounding box of a list of items
function calcularBoundingBox(items: any[]): { minX: number, minY: number, centerY: number, width: number, height: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const item of items) {
    const x = Number(item.x);
    const y = Number(item.y);
    const width = Number(item.width);
    const height = Number(item.height);

    if (!isFinite(x) || !isFinite(y) || !isFinite(width) || !isFinite(height)) {
      console.warn("⚠️ Item with invalid values in bounding box:", item);
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
    console.error("❌ Bounding box contains invalid values. Returning default values.");
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

// Validates that all items in a frame have valid values
function validateFrameItems(frame: any): boolean {
  const errors = [];

  for (const item of frame.items) {
    const problems = [];

    const xRel = Number(item.xRel);
    const yRel = Number(item.yRel);
    const width = Number(item.width);
    const height = Number(item.height);

    if (!isFinite(xRel)) problems.push("xRel invalid");
    if (!isFinite(yRel)) problems.push("yRel invalid");
    if (!isFinite(width)) problems.push("width invalid");
    if (!isFinite(height)) problems.push("height invalid");

    if (!isFinite(frame.x)) problems.push("frame.x invalid");
    if (!isFinite(frame.y)) problems.push("frame.y invalid");
    if (!isFinite(frame.width)) problems.push("frame.width invalid");
    if (!isFinite(frame.height)) problems.push("frame.height invalid");

    if (problems.length > 0) {
      errors.push({
        itemId: item.id,
        type: item.type,
        problems,
        item,
      });
    }
  }

  if (errors.length > 0) {
    console.group("❌ Item validation failed:");
    errors.forEach((e, i) => {
      console.warn(`Item ${i + 1}:`, e.problems.join(", "), e.item);
    });
    console.groupEnd();
    return false;
  }

  console.log("✅ All frame items are valid.");
  return true;
}

// Pauses execution for the specified milliseconds
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.render(<App />, root);
}
