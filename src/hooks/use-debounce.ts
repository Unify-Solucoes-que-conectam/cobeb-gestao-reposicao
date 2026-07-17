import { useCallback, useEffect, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
) {
  // Guardamos o callback em um Ref para evitar que re-renderizações 
  // do componente recriem o timer desnecessariamente.
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sempre atualiza o callback mais recente
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Limpa o timer se o componente for desmontado da tela
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Retorna a função que será de fato chamada no seu input/efeito
  return useCallback(
    (...args: Parameters<T>) => {

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}