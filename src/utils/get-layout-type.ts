const LAYOUT_STRING_OVERRIDES: Record<string, string> = {
  carousel: 'carousel',
  highlighted_group: 'highlighted',
}

export const getLayoutType = (layout: string): string => {
  return LAYOUT_STRING_OVERRIDES[layout] ?? layout
}
