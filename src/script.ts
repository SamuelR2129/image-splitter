import JSZip from "jszip";
import { saveAs } from "file-saver";

// Constants
const IMAGE_URL = "./figma-feed.png";
const ROWS = 3;
const COLUMNS = 2;

async function createImageGrid() {
  const grid = document.getElementById("image-grid")!;
  const img = new Image();
  img.src = `${IMAGE_URL}?t=${Date.now()}`;
  await img.decode();

  // Set grid container height to maintain original aspect ratio
  const gridWidth = grid.offsetWidth;
  const aspectRatio = img.height / img.width;
  grid.style.height = `${gridWidth * aspectRatio}px`;

  const sliceWidth = 1013;
  const sliceHeight = 1350;

  console.log("slicewidth", sliceWidth, "sliceHeight", sliceHeight);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = sliceWidth;
  canvas.height = sliceHeight;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      ctx.clearRect(0, 0, sliceWidth, sliceHeight);

      // Draw the exact portion of the image
      ctx.drawImage(img, col * sliceWidth, row * sliceHeight, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight);

      const gridItem = document.createElement("div");
      gridItem.className = "grid-item";
      gridItem.style.paddingTop = `${(sliceHeight / sliceWidth) * 100}%`;

      const imgElement = document.createElement("img");
      imgElement.src = canvas.toDataURL();
      imgElement.style.position = "absolute";
      imgElement.style.top = "0";
      imgElement.style.left = "0";

      gridItem.appendChild(imgElement);
      grid.appendChild(gridItem);
    }
  }
}

async function downloadSlices() {
  const img = new Image();
  img.src = IMAGE_URL;
  await img.decode();

  const zip = new JSZip();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const sliceWidth = img.width / COLUMNS;
  const sliceHeight = img.height / ROWS;

  canvas.width = sliceWidth;
  canvas.height = sliceHeight;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      ctx.clearRect(0, 0, sliceWidth, sliceHeight);

      ctx.drawImage(img, col * sliceWidth, row * sliceHeight, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight);

      const dataUrl = canvas.toDataURL();
      const base64 = dataUrl.split(",")[1];
      zip.file(`slice-${row}-${col}.png`, base64, { base64: true });
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "sliced-images.zip");
}

document.getElementById("download-btn")!.addEventListener("click", downloadSlices);
createImageGrid();
