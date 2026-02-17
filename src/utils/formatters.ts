export function formatCPF(value: string) {
  return value
    .replace(/\D/g, '') // remove tudo que não for número
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
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
