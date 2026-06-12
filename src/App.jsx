import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import SpiritVeinGame from './SpiritVeinGame'
import './index.css'

const markdownComponents = {
  p: ({ children }) => <>{children}</>,
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
}

function parseMarkdownWithTables(markdown) {
  const lines = markdown.split('\n')
  const parts = []
  let buffer = []
  let i = 0

  const flushMarkdown = () => {
    if (buffer.length > 0) {
      parts.push({ type: 'markdown', content: buffer.join('\n') })
      buffer = []
    }
  }

  while (i < lines.length) {
    const line = lines[i]
    const nextLine = lines[i + 1]

    if (line.includes('|') && nextLine && isTableDivider(nextLine)) {
      flushMarkdown()

      const header = splitTableRow(line)
      const rows = []
      i += 2

      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitTableRow(lines[i]))
        i += 1
      }

      parts.push({ type: 'table', header, rows })
      continue
    }

    buffer.push(line)
    i += 1
  }

  flushMarkdown()
  return parts
}

function MarkdownTable({ header, rows }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={index}>
                <ReactMarkdown components={markdownComponents}>{cell}</ReactMarkdown>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {header.map((_, cellIndex) => (
                <td key={cellIndex}>
                  <ReactMarkdown components={markdownComponents}>{row[cellIndex] || ''}</ReactMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MarkdownReport({ content }) {
  return parseMarkdownWithTables(content).map((part, index) => {
    if (part.type === 'table') {
      return <MarkdownTable key={index} header={part.header} rows={part.rows} />
    }

    return <ReactMarkdown key={index}>{part.content}</ReactMarkdown>
  })
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [report1Content, setReport1Content] = useState('')
  const [report2Content, setReport2Content] = useState('')
  const [report3Content, setReport3Content] = useState('')
  const [report4Content, setReport4Content] = useState('')

  useEffect(() => {
    if (activeTab === 'task1' && !report1Content) {
      fetch(import.meta.env.BASE_URL + 'Task1_Report.md')
        .then(res => res.text())
        .then(text => { setReport1Content(text) })
        .catch(() => { setReport1Content('Failed to load the report.') })
    }
    if (activeTab === 'task2' && !report2Content) {
      fetch(import.meta.env.BASE_URL + 'Task2_Website_Report.md')
        .then(res => res.text())
        .then(text => { setReport2Content(text) })
        .catch(() => { setReport2Content('Failed to load the report.') })
    }
    if (activeTab === 'task3' && !report3Content) {
      fetch(import.meta.env.BASE_URL + 'Task3_AI_Agent_Report.md')
        .then(res => res.text())
        .then(text => { setReport3Content(text) })
        .catch(() => { setReport3Content('Failed to load the report.') })
    }
    if (activeTab === 'task4Report' && !report4Content) {
      fetch(import.meta.env.BASE_URL + 'Task4_Spirit_Vein_Game_Report.md')
        .then(res => res.text())
        .then(text => { setReport4Content(text) })
        .catch(() => { setReport4Content('Failed to load the report.') })
    }
  }, [activeTab, report1Content, report2Content, report3Content, report4Content])

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
        <button 
          className={`nav-button ${activeTab === 'task3' ? 'active' : ''}`}
          onClick={() => setActiveTab('task3')}
        >
          Task 3 Report
        </button>
        <button
          className={`nav-button ${activeTab === 'task4' ? 'active' : ''}`}
          onClick={() => setActiveTab('task4')}
        >
          Task 4 Game
        </button>
        <button
          className={`nav-button ${activeTab === 'task4Report' ? 'active' : ''}`}
          onClick={() => setActiveTab('task4Report')}
        >
          Task 4 Report
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
            <p>Feel free to navigate through the tabs above to view my detailed technical reports and the Assignment 4 game prototype!</p>
          </div>
        )}

        {activeTab === 'task1' && (
          <div className="report-content">
            {!report1Content ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <MarkdownReport content={report1Content} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'task2' && (
          <div className="report-content">
            {!report2Content ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <MarkdownReport content={report2Content} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'task3' && (
          <div className="report-content">
            {!report3Content ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <MarkdownReport content={report3Content} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'task4' && <SpiritVeinGame />}

        {activeTab === 'task4Report' && (
          <div className="report-content">
            {!report4Content ? (
              <div className="loading">Loading report...</div>
            ) : (
              <div className="markdown-body">
                <MarkdownReport content={report4Content} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
