import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>Teste - StackHabit</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
        <p>Verificando se o Tailwind funciona:</p>
        <div className="bg-blue-500 text-white p-4 rounded">
          Esta div deve ter fundo azul se o Tailwind estiver funcionando
        </div>
      </div>
    </div>
  );
};

