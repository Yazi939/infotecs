import React from 'react';
import './App.css';
import UserTable from './components/UserTable';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Приложение "Таблица пользователей"</h1>
        <p>Задание для стажировки InfoTecs</p>
      </header>
      
      <main className="App-main">
        <UserTable />
      </main>
    </div>
  );
}

export default App;
