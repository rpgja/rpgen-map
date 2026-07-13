import { RPGMap } from '../dist/index.js';

function escapeHtml(unsafe) {
  return (unsafe || "").toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createJsonTree(data, isRoot = false, depth = 0) {
  if (data === null) return `<span class="json-null">null</span>`;
  if (typeof data === 'number') return `<span class="json-number">${data}</span>`;
  if (typeof data === 'boolean') return `<span class="json-boolean">${data}</span>`;
  if (typeof data === 'string') return `<span class="json-string">"${escapeHtml(data)}"</span>`;

  let obj = data;
  if (data && typeof data === 'object') {
    if (typeof data.entries === 'function' && !Array.isArray(data)) {
      obj = Object.fromEntries(data.entries());
    } else if (data instanceof Set) {
      obj = Array.from(data);
    }
  }

  const isArray = Array.isArray(obj);
  const keys = Object.keys(obj);
  
  if (keys.length === 0) {
    return isArray ? `[]` : `{}`;
  }

  const openAttr = (isRoot || depth < 2) ? 'open' : '';
  let html = `<details class="json-node" ${openAttr}><summary class="json-summary">${isArray ? '[' : '{'}</summary><div class="json-children">`;
  
  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    const valueHtml = createJsonTree(obj[key], false, depth + 1);
    html += `<div class="json-item">`;
    if (!isArray) {
      html += `<span class="json-key">"${escapeHtml(key)}"</span>: `;
    }
    html += `${valueHtml}${isLast ? '' : ','}</div>`;
  });

  html += `</div>${isArray ? ']' : '}'}</details>`;
  return html;
}

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('raw-input');
  const outputEl = document.getElementById('json-output');
  const parseBtn = document.getElementById('parse-button');
  const spinner = document.getElementById('loading-spinner');

  parseBtn.addEventListener('click', () => {
    const rawData = inputEl.value;
    
    if (!rawData.trim()) {
      outputEl.innerHTML = createJsonTree({ error: "Input is empty." }, true);
      return;
    }

    spinner.classList.remove('hidden');
    outputEl.innerHTML = '<span class="json-null">Parsing...</span>';
    
    setTimeout(() => {
      try {
        const parsedMap = RPGMap.parse(rawData);
        
        console.log('--- Successfully Parsed RPGEN Map ---');
        console.log(parsedMap);
        
        outputEl.innerHTML = createJsonTree(parsedMap, true);
        
      } catch (err) {
        console.error(err);
        outputEl.innerHTML = createJsonTree({
          error: "Failed to parse map data.",
          message: err.message,
          stack: err.stack
        }, true);
      } finally {
        spinner.classList.add('hidden');
      }
    }, 100);
  });
});
