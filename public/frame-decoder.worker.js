// Web Worker: decodes frames to ImageBitmap off the main thread
// Receives: { index: number, src: string }
// Sends back: { index: number, bitmap: ImageBitmap } or { index: number, error: true }

self.onmessage = async (e) => {
  const { index, src } = e.data;
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    // Transfer bitmap to main thread — zero copy
    self.postMessage({ index, bitmap }, [bitmap]);
  } catch {
    self.postMessage({ index, error: true });
  }
};
