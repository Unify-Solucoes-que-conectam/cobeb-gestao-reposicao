import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Faz o download de um Blob criando um link temporário.
 *
 * @param blob - O Blob que será baixado
 * @param filename - Nome do arquivo a ser salvo
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.setAttribute('href', url)
  a.setAttribute('style', 'display: none')
  a.setAttribute('download', filename)

  document.body.appendChild(a)
  a.click()

  a.parentNode?.removeChild(a)
  window.URL.revokeObjectURL(url)
}