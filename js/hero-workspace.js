(function () {
  'use strict';

  const examples = {
    node: {
      label: 'Node.js',
      filename: 'server.js',
      guide: '/post/nodejs-backend-development-production-api',
      code: [
        'const http = require("node:http");',
        '',
        'http.createServer((req, res) => {',
        '  res.writeHead(200, {',
        '    "Content-Type": "application/json"',
        '  });',
        '  res.end(JSON.stringify({ status: "ok" }));',
        '}).listen(3000);'
      ].join('\n'),
      output: '{\n  "status": "ok"\n}'
    },
    java: {
      label: 'Spring Boot',
      filename: 'HealthController.java',
      guide: '/post/spring-boot-rest-api-java-21-production-setup',
      code: [
        'import java.util.Map;',
        'import org.springframework.web.bind.annotation.*;',
        '',
        '@RestController',
        'public class HealthController {',
        '  @GetMapping("/health")',
        '  public Map<String, String> health() {',
        '    return Map.of("status", "ok");',
        '  }',
        '}'
      ].join('\n'),
      output: '{\n  "status": "ok"\n}'
    },
    ai: {
      label: 'AI',
      filename: 'ai-workflow.js',
      guide: '/post/gpt-6-astra-explained',
      code: [
        'const workflow = {',
        '  task: "Add a health endpoint",',
        '  steps: ["Plan", "Implement", "Review"],',
        '  checks: ["Tests pass", "No secrets"]',
        '};',
        '',
        'console.log(JSON.stringify(workflow, null, 2));'
      ].join('\n'),
      output: JSON.stringify({
        task: 'Add a health endpoint',
        steps: ['Plan', 'Implement', 'Review'],
        checks: ['Tests pass', 'No secrets']
      }, null, 2)
    }
  };

  function initWorkspace() {
    const workspace = document.getElementById('hero-workspace');
    if (!workspace) return;

    const code = workspace.querySelector('#workspace-code');
    const filename = workspace.querySelector('#workspace-filename');
    const topicLabel = workspace.querySelector('#workspace-topic-label');
    const status = workspace.querySelector('#workspace-status');
    const guide = workspace.querySelector('#workspace-guide');
    const topics = workspace.querySelector('.workspace-topics');
    const copyButton = workspace.querySelector('#workspace-copy');
    const outputToggle = workspace.querySelector('#workspace-output-toggle');
    const output = workspace.querySelector('#workspace-output');
    const topicButtons = Array.from(workspace.querySelectorAll('[data-workspace-topic]'))
      .filter(button => Object.prototype.hasOwnProperty.call(examples, button.dataset.workspaceTopic));
    if (!code || !filename || !topicLabel || !status || !guide || !topics || !topicButtons.length) return;

    let selectedTopic = 'node';

    function renderCode(snippet) {
      const fragment = document.createDocumentFragment();
      snippet.split('\n').forEach((line, index) => {
        if (index) fragment.appendChild(document.createTextNode('\n'));
        const lineElement = document.createElement('span');
        lineElement.className = 'workspace-code-line';
        const tokens = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|return|import|public|class|new|static|void)\b)/g;
        let start = 0;
        let match;
        while ((match = tokens.exec(line)) !== null) {
          lineElement.appendChild(document.createTextNode(line.slice(start, match.index)));
          const token = document.createElement('span');
          token.className = /^["']/.test(match[0]) ? 'workspace-syntax-string' : 'workspace-syntax-keyword';
          token.textContent = match[0];
          lineElement.appendChild(token);
          start = match.index + match[0].length;
        }
        lineElement.appendChild(document.createTextNode(line.slice(start)));
        fragment.appendChild(lineElement);
      });
      code.replaceChildren(fragment);
    }

    function setOutputVisible(visible) {
      if (!output || !outputToggle) return;
      output.hidden = !visible;
      outputToggle.setAttribute('aria-expanded', String(visible));
      outputToggle.textContent = visible ? 'Hide response' : 'Preview response';
    }

    function selectTopic(topic, announce) {
      const example = examples[topic];
      if (!example) return;
      selectedTopic = topic;
      renderCode(example.code);
      filename.textContent = example.filename;
      topicLabel.textContent = example.label;
      guide.setAttribute('href', example.guide);
      guide.textContent = 'Read the ' + example.label + ' guide';
      const guideArrow = document.createElement('span');
      guideArrow.setAttribute('aria-hidden', 'true');
      guideArrow.textContent = '↗';
      guide.appendChild(guideArrow);
      topicButtons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.workspaceTopic === topic));
      });
      if (output) output.textContent = example.output;
      setOutputVisible(false);
      if (announce) status.textContent = example.label + ' example selected.';
    }

    const initialButton = topicButtons.find(button => button.getAttribute('aria-pressed') === 'true') || topicButtons[0];
    selectTopic(initialButton.dataset.workspaceTopic, false);

    topicButtons.forEach((button, index) => {
      button.addEventListener('click', () => selectTopic(button.dataset.workspaceTopic, true));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % topicButtons.length;
        else if (event.key === 'ArrowLeft') next = (index + topicButtons.length - 1) % topicButtons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = topicButtons.length - 1;
        else return;
        event.preventDefault();
        topicButtons[next].focus();
        selectTopic(topicButtons[next].dataset.workspaceTopic, true);
      });
    });

    if (copyButton) {
      copyButton.addEventListener('click', async () => {
        const example = examples[selectedTopic];
        copyButton.disabled = true;
        try {
          await navigator.clipboard.writeText(example.code);
          status.textContent = 'Copied ' + example.filename + '.';
        } catch (_) {
          status.textContent = 'Copy unavailable. Select the code and copy it manually.';
        } finally {
          copyButton.disabled = false;
        }
      });
      copyButton.hidden = false;
    }

    if (output && outputToggle) {
      outputToggle.setAttribute('aria-controls', output.id);
      outputToggle.addEventListener('click', () => {
        const visible = output.hidden;
        setOutputVisible(visible);
        status.textContent = visible ? 'Example response shown.' : 'Example response hidden.';
      });
      outputToggle.hidden = false;
    }
    topics.hidden = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkspace, { once: true });
  } else {
    initWorkspace();
  }
})();
