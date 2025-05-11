import './App.css'
import { ChatBox } from './components/ChatBox'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Chat</h1>
        <p>Ask any question and get a response from the AI</p>
      </header>

      <main className="app-main">
        <ChatBox type="general"/>

        <ChatBox type="ragged"/>
      </main>

      <footer className="app-footer">
        <p>Powered by FastAPI and React</p>
      </footer>
    </div>
  )
}

export default App
