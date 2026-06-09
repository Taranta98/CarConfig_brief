export const COME_FUNZIONA_SECTION_ID = 'come-funziona'

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
