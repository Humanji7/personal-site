export function stageToPx(stage, viewport) {
  const x = (stage.x * 0.5 + 0.5) * viewport.w;
  const y = ((-stage.y) * 0.5 + 0.5) * viewport.h;
  return { x, y };
}

export function rectToNdc(rect, viewport) {
  const x0 = (rect.left / viewport.w) * 2 - 1;
  const x1 = ((rect.left + rect.width) / viewport.w) * 2 - 1;
  const y0 = -(((rect.top + rect.height) / viewport.h) * 2 - 1);
  const y1 = -((rect.top / viewport.h) * 2 - 1);
  return { x0, y0, x1, y1 };
}

