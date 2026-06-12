# Assignment 3: Deployment and Integration of AI Agents

**Student Name**: 龚科市  
**Student ID**: ZY2557102  

## Objective

This assignment focuses on using Large Language Models (LLMs) as AI agents in a real development workflow. The work is organized according to the assignment requirements:

1. **Understand AI Agents**: Configure and compare online and local LLMs.
2. **Workflow Integration**: Integrate LLM assistance into an IDE-based coding workflow.
3. **Reflective Documentation**: Record the setup process, compare model choices, and summarize practical lessons.

For this submission, the final deliverable is a Markdown report. The online model part documents the configuration and reproducible workflow design rather than publishing a public LLM service.

## I. Agent Deployment & Interaction (15 pts)

### 1. Online Agent (5 pts)

#### 1.1 Online Model and Credential Management

I selected DeepSeek as the online model provider.

| Item | Value |
| --- | --- |
| Provider | DeepSeek |
| Key Name | buaa_cs |
| Model Type | Online chat model |
| API Key Handling | Stored locally as an environment variable; not committed to source code or written in this report |

The API key should be handled as a secret. A safe local setup command would be:

```bash
export DEEPSEEK_API_KEY="your_deepseek_api_key_here"
```

This keeps the key out of the website source code, the Markdown report, and Git history.

#### 1.2 Agent Task: Analyze a File

The designed online agent task is file analysis:

> Read a source file or Markdown report, summarize its purpose, identify possible issues, and suggest improvements.

This task goes beyond simple chatting because the model needs to read context, extract important information, and return actionable feedback.

#### 1.3 Example Implementation with a Simple Python Script

The following script shows how the online agent can be implemented. It reads a local file, sends the file content to the DeepSeek API, and asks the model to analyze it.

```python
import os
import requests

API_KEY = os.environ.get("DEEPSEEK_API_KEY")

with open("Task1_Report.md", "r", encoding="utf-8") as file:
    content = file.read()

payload = {
    "model": "deepseek-chat",
    "messages": [
        {
            "role": "system",
            "content": "You are a careful software engineering assistant. Analyze files and give concise suggestions."
        },
        {
            "role": "user",
            "content": f"Please analyze this report and suggest improvements:\n\n{content}"
        }
    ]
}

response = requests.post(
    "https://api.deepseek.com/chat/completions",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json=payload,
    timeout=60
)

print(response.json()["choices"][0]["message"]["content"])
```

#### 1.4 Expected Result

For the file analysis task, the online agent should produce:

1. A short summary of the file.
2. A list of strengths.
3. A list of missing details or possible problems.
4. Concrete revision suggestions.

This kind of agent is useful for checking whether a report covers assignment requirements and for improving documentation quality.

### 2. Local Model Deployment (4 pts)

#### 2.1 Ollama Installation Plan

Ollama is a convenient tool for running local LLMs. A typical setup is:

```bash
brew install ollama
ollama serve
ollama pull qwen2.5:7b
```

After downloading the model, a basic terminal interaction can be started with:

```bash
ollama run qwen2.5:7b
```

#### 2.2 Basic Interaction Example

A simple prompt for the local model could be:

```text
Explain the difference between Python and C implementations of matrix multiplication.
Focus on execution speed, memory management, and compilation.
```

The local model can be used for short explanations, code comments, and simple refactoring suggestions. It is especially useful when files should remain on the local machine.

#### 2.3 Observed Strengths and Limitations

| Aspect | Observation |
| --- | --- |
| Privacy | Local files do not need to be sent to an external API |
| Network Dependency | The model can run without online API calls after setup |
| Hardware Requirement | Speed depends on local CPU, GPU, and memory |
| Reasoning Quality | Smaller local models may be weaker than stronger online models |
| Setup Cost | Requires model download and local runtime configuration |

### 3. IDE Integration (3 pts)

#### 3.1 Integration Choice

For development workflow integration, an IDE assistant such as Continue, Cursor, or Cline can connect to online or local models. The assistant can read code inside the editor and help with explanation, debugging, or refactoring.

#### 3.2 Example: Explaining Matrix Multiplication Code

In this project, the AI assistant can help explain the matrix multiplication code from Task 1:

```python
for i in range(rows_A):
    for j in range(cols_B):
        for k in range(cols_A):
            result[i][j] += A[i][k] * B[k][j]
```

The assistant should explain that:

1. The outer loop selects a row from matrix A.
2. The middle loop selects a column from matrix B.
3. The inner loop computes the dot product.
4. The time complexity is O(n^3) for square matrices.

This is useful because it connects code behavior with algorithmic concepts.

#### 3.3 Example: Refactoring Help

The IDE assistant can also suggest small improvements, such as:

1. Separating matrix file reading, multiplication, and writing into different functions.
2. Adding dimension checks before multiplication.
3. Improving error messages when input files are invalid.
4. Adding simple test cases for 2x2 and 3x3 matrices.

### 4. Documentation & Reflection (3 pts)

#### 4.1 Setup Process Summary

| Step | What I Did | Purpose |
| --- | --- | --- |
| Online model setup | Prepared a DeepSeek API credential | Enable online agent access |
| Agent task design | Chose file analysis as the main task | Make the model useful for development work |
| Local model plan | Documented Ollama setup and interaction commands | Understand local deployment workflow |
| IDE integration | Described how an assistant can explain and refactor code | Connect LLMs with daily programming |
| Website integration | Added this Markdown report to the personal blog | Make the assignment accessible from the website |

#### 4.2 Challenges and Solutions

| Challenge | Solution |
| --- | --- |
| Avoiding API key leakage | Store the key as an environment variable and never commit it |
| Choosing an agent task | Focus on file analysis because it matches software engineering work |
| Local model hardware limits | Use a moderate-size model such as Qwen 2.5 7B |
| IDE integration complexity | Start with explanation and refactoring before autonomous coding |
| Report-only delivery | Document the workflow clearly without pretending that a public service was deployed |

#### 4.3 Online vs Local Model Comparison

| Dimension | Online Model: DeepSeek | Local Model: Ollama |
| --- | --- | --- |
| Setup Difficulty | Requires API key and network access | Requires model download and local runtime |
| Speed | Usually faster for larger models | Depends on local hardware |
| Privacy | Files may be sent to an external API | Files can remain on the local machine |
| Cost | May consume API quota | No API quota after local setup |
| Best Use Case | Strong reasoning, file analysis, polished suggestions | Private drafts, simple explanations, offline work |
| Limitation | Requires careful secret management | Weaker performance on limited hardware |

#### 4.4 Reflection

The online model is easier to use for high-quality reasoning because the provider manages the model runtime. It is especially useful for report review, code explanation, and structured feedback. The main concern is privacy, so secrets and personal files must be handled carefully.

The local model is less convenient at first because it requires installation and model downloads. However, it provides better privacy and can still help with simple coding tasks. For my workflow, the best strategy is to use the online model for difficult reasoning and the local model for private or lightweight tasks.

IDE integration is the most practical part of the assignment. Instead of using LLMs only as chatbots, connecting them to the editor makes them part of the development process. The assistant can read code, explain logic, and suggest improvements while I am working.

## II. Bonus: Agent Optimization (+3 pts)

### Bonus Task: Optimize a Local Model for Code Explanation

For the bonus task, I focused on improving a local model's performance on a specific coding explanation task. The target task is:

> Explain the Task 1 matrix multiplication program clearly enough for a beginner to understand the algorithm, the file I/O process, and the performance difference between Python and C.

Because the final submission is a report, this section records the optimization method, prompt design, knowledge base design, and comparison criteria rather than publishing a live agent service.

### 1. Baseline Local Model Prompt

The baseline prompt is short and direct:

```text
Explain this matrix multiplication code.
```

This prompt is easy to use, but it has several weaknesses:

1. It does not specify the target audience.
2. It does not require step-by-step reasoning.
3. It may ignore file input/output details.
4. It may not connect the code with time complexity or performance analysis.

### 2. Optimized System Prompt

To improve the answer, I designed a more specific system prompt:

```text
You are a teaching assistant for an undergraduate software engineering course.
Explain code step by step for a beginner.
When explaining matrix multiplication, always cover:
1. input matrix dimensions,
2. row-column dot product logic,
3. file reading and writing workflow,
4. time complexity,
5. differences between Python and C implementations.
Use concise paragraphs and include a short checklist of possible improvements.
```

This prompt constrains the model's role, audience, output structure, and required technical points.

### 3. Knowledge Base / RAG Design

I also designed a small knowledge base for retrieval-augmented generation (RAG). The knowledge base would contain:

1. The Task 1 matrix multiplication source code.
2. The Task 1 Markdown report.
3. Notes about time complexity and Python/C performance differences.

| Knowledge Item | Purpose |
| --- | --- |
| `matrix_mul.py` | Provide the actual Python implementation |
| `matrix_mul.c` | Provide the C implementation for comparison |
| `Task1_Report.md` | Provide project context and measured execution times |
| Complexity notes | Help the model mention O(n^3) and row-column dot products |

With these documents, the local model can answer using project-specific context instead of relying only on general knowledge.

### 4. Optimized Output Structure

The optimized agent should produce answers in this structure:

1. **Program Goal**: What the code is trying to compute.
2. **Input and Output**: Where matrices come from and where results are saved.
3. **Core Algorithm**: How the triple nested loop computes each result cell.
4. **Complexity**: Why the algorithm is O(n^3) for square matrices.
5. **Python vs C**: Why C is faster in the performance test.
6. **Improvement Suggestions**: Tests, error handling, and documentation improvements.

### 5. Comparison with Online Model

| Criterion | Baseline Local Prompt | Optimized Local Agent | Online DeepSeek Agent |
| --- | --- | --- | --- |
| Code explanation | Often general | More structured and step-by-step | Usually detailed and fluent |
| Assignment relevance | May miss report requirements | Explicitly tied to Task 1 requirements | Strong if the full report is provided |
| Performance discussion | May be brief | Required by the prompt | Usually strong |
| Privacy | Local | Local | Requires sending content to API |
| Setup effort | Low after local model setup | Medium because prompt/RAG design is needed | Low after API key setup |
| Best use | Quick explanation | Private course-work review | High-quality external review |

### 6. Optimization Result

The optimized local agent is better than the baseline prompt because it forces the model to cover the exact points required by the task. The improvement does not come from changing the model itself, but from giving it a clearer role, a better answer structure, and project-specific context through a small knowledge base.

The online DeepSeek agent is still expected to provide stronger language quality and reasoning, but the optimized local agent has a privacy advantage because code and reports can remain on the local machine.

## Grading Rubric Coverage

| Criteria | Where Covered |
| --- | --- |
| Online Agent (Web search/File analysis) | I.1 Online Agent |
| Local Model (Ollama deployment) | I.2 Local Model Deployment |
| IDE Integration (AI in VSCode/PyCharm) | I.3 IDE Integration |
| Documentation Quality & Reflection | I.4 Documentation & Reflection |
| Bonus: Local Agent Optimization | II. Bonus: Agent Optimization |
