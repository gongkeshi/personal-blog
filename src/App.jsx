import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [reportContent, setReportContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'report' && !reportContent) {
      setLoading(true)
      fetch('/Task1_Report.md')
        .then(res => res.text())
        .then(text => {
          setReportContent(text)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch report:', err)
          setReportContent('Failed to load the report.')
          setLoading(false)
        })
    }
  }, [activeTab, reportContent])

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
          Home
        </button>
        <button 
          className={`nav-button ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Task 1 Report
        </button>
      </nav>

      <main className="content-area">
        {activeTab === 'home' && (
          <div className="home-content markdown-body">
            <h2>Welcome to my Personal Blog! 🚀</h2>
            <p>
              This static website is built using <strong>React</strong> and <strong>Vite</strong>. 
              It serves as my digital portfolio for showcasing course assignments, thoughts, and technical reports.
            </p>
            <p>
              I chose React as my "Advanced Framework" for this assignment to explore modern, component-driven web development. 
              The design features a glassmorphism aesthetic with subtle animations to create a premium feel.
            </p>
            <h3>Features of this Blog:</h3>
            <ul>
              <li>⚡ Lightning fast loading with Vite</li>
              <li>🎨 Modern Glassmorphism UI & Dynamic Gradients</li>
              <li>📄 Seamless Markdown Rendering</li>
              <li>📱 Responsive Design</li>
            </ul>
            <p>Feel free to navigate to the <strong>Task 1 Report</strong> tab to view my initial assignment.</p>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="report-content">
            {loading ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown>{reportContent}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
