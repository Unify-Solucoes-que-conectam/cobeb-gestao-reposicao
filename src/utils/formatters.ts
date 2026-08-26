export function formatCPF(value: string | null | undefined) {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/\D/g, '') // remove tudo que não for número
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

export function capitalizeName(nome: string) {
  const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];

  return nome
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((palavra, index) => {
      if (index !== 0 && preposicoes.includes(palavra)) {
        return palavra; // mantém minúsculo
      }

      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Formata um número ou string numérica para o padrão de moeda brasileiro (R$ 0,00).
 * @param {number|string} value - O valor a ser formatado.
 * @returns {string} O valor formatado como moeda.
 */
export function formatCurrency(value: string | number): string {
  // Converte para número e valida se é um valor utilizável
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numberValue) || numberValue === null || numberValue === undefined) {
    return 'R$\u00A00,00'; // Retorna zero formatado caso receba um valor inválido
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
}