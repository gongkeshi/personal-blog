import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [report1Content, setReport1Content] = useState('')
  const [report2Content, setReport2Content] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'task1' && !report1Content) {
      setLoading(true)
      fetch(import.meta.env.BASE_URL + 'Task1_Report.md')
        .then(res => res.text())
        .then(text => { setReport1Content(text); setLoading(false) })
        .catch(err => { setReport1Content('Failed to load the report.'); setLoading(false) })
    }
    if (activeTab === 'task2' && !report2Content) {
      setLoading(true)
      fetch(import.meta.env.BASE_URL + 'Task2_Website_Report.md')
        .then(res => res.text())
        .then(text => { setReport2Content(text); setLoading(false) })
        .catch(err => { setReport2Content('Failed to load the report.'); setLoading(false) })
    }
  }, [activeTab, report1Content, report2Content])

  return (
    <div className="app-container">
      <header>
        <h1 className="gradient-text">龚科市's Digital Garden</h1>
        <p className="subtitle">Software Engineering & Remote Development (Student ID: ZY2557102)</p>
      </header>

      <nav>
        <button 
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          About Me
        </button>
        <button 
          className={`nav-button ${activeTab === 'task1' ? 'active' : ''}`}
          onClick={() => setActiveTab('task1')}
        >
          Task 1 Report
        </button>
        <button 
          className={`nav-button ${activeTab === 'task2' ? 'active' : ''}`}
          onClick={() => setActiveTab('task2')}
        >
          Task 2 Report
        </button>
      </nav>

      <main className="content-area">
        {activeTab === 'home' && (
          <div className="home-content markdown-body">
            <h2>About Me 👨‍💻</h2>
            <p>
              Hello! I am <strong>龚科市</strong> (Student ID: ZY2557102), a student exploring the realms of Software Engineering and Remote Development.
            </p>
            <p>
              This static website serves as my digital portfolio for showcasing course assignments, thoughts, and technical reports. 
              Instead of using standard generators like Sphinx, I decided to challenge myself by building this site entirely from scratch using modern web technologies to achieve the <strong>Advanced Framework Bonus</strong>.
            </p>
            <h3>Tools & Technologies Used:</h3>
            <ul>
              <li>⚡ <strong>Vite</strong> - For blazing fast local development and optimized static builds.</li>
              <li>⚛️ <strong>React</strong> - To create a highly interactive, component-driven UI.</li>
              <li>🎨 <strong>Vanilla CSS</strong> - Utilizing CSS Variables to create a beautiful, modern Light Icy Glassmorphism theme.</li>
              <li>📄 <strong>react-markdown</strong> - To natively fetch and render my assignment Markdown reports dynamically in the browser.</li>
            </ul>
            <p>Feel free to navigate through the tabs above to view my detailed technical reports for Assignment 1 and Assignment 2!</p>
          </div>
        )}

        {activeTab === 'task1' && (
          <div className="report-content">
            {loading ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown>{report1Content}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {activeTab === 'task2' && (
          <div className="report-content">
            {loading ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown>{report2Content}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
