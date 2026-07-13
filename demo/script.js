import { RPGMap } from '../dist/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('raw-input');
  const outputEl = document.getElementById('json-output');
  const parseBtn = document.getElementById('parse-button');
  const spinner = document.getElementById('loading-spinner');

  parseBtn.addEventListener('click', () => {
    const rawData = inputEl.value;
    
    if (!rawData.trim()) {
      outputEl.textContent = JSON.stringify({ error: "Input is empty." }, null, 2);
      outputEl.style.color = 'var(--accent-hover)';
      return;
    }

    // UI state updates
    spinner.classList.remove('hidden');
    outputEl.textContent = 'Parsing...';
    outputEl.style.color = 'var(--text-muted)';
    
    // Slight timeout to allow UI to render spinner before heavy parsing
    setTimeout(() => {
      try {
        const parsedMap = RPGMap.parse(rawData);
        
        // Output to Console
        console.log('--- Successfully Parsed RPGEN Map ---');
        console.log(parsedMap);
        
        // Output to UI
        outputEl.textContent = JSON.stringify(parsedMap, null, 2);
        outputEl.style.color = 'var(--text-main)';
        
      } catch (err) {
        console.error(err);
        outputEl.textContent = JSON.stringify({
          error: "Failed to parse map data.",
          message: err.message,
          stack: err.stack
        }, null, 2);
        outputEl.style.color = '#ff7b72'; // GitHub red
      } finally {
        spinner.classList.add('hidden');
      }
    }, 100);
  });
});
