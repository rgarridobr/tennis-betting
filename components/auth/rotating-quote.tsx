'use client';

import { useEffect, useState } from 'react';

const QUOTES = [
  '“No tênis, cada ponto conta uma história — de foco, coragem e paixão.”',
  '“Entre linhas e silêncios, o tênis revela quem você é quando a bola volta.”',
  '“O jogo começa antes do saque.”',
  '“No tênis, a mente é tão afiada quanto a raquete.”',
  '“Cada partida é uma nova chance de se reinventar.”',
];

export function RotatingQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p
      key={index}
      className="text-white/90 text-xl font-medium max-w-md transition-opacity duration-700 ease-in-out animate-fade"
    >
      {QUOTES[index]}
    </p>
  );
}
