import './App.css'
import { ChatBox } from './components/ChatBox'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <p>Header</p>
      </header>

      <main className="app-main">
        <ChatBox type="general"/>

        <ChatBox type="ragged"/>
      </main>

      <footer className="app-footer">
        <p>Footer </p>
      </footer>
    </div>
  )
}

export default App
