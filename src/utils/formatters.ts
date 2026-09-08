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
  return formatBrazilianPhoneInput(phone)
}

export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function formatBrazilianPhoneInput(phone: string): string {
  let digits = unformatPhone(phone).slice(0, 13)
  let prefix = ''

  if (digits.startsWith('55') && digits.length > 11) {
    prefix = '+55 '
    digits = digits.slice(2)
  } else {
    digits = digits.slice(0, 11)
  }

  if (digits.length <= 2) return `${prefix}${digits}`

  const ddd = digits.slice(0, 2)
  const subscriber = digits.slice(2)
  const split = subscriber.length > 8 ? 5 : 4

  if (subscriber.length <= split) return `${prefix}(${ddd}) ${subscriber}`

  return `${prefix}(${ddd}) ${subscriber.slice(0, split)}-${subscriber.slice(split, split + 4)}`
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
