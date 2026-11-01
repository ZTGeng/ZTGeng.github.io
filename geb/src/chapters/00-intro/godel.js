import './godel.css';

const choices = [...document.querySelectorAll('[data-proof-case]')];
const results = [...document.querySelectorAll('.proof-result')];
const announcement = document.querySelector('#proof-announcement');

for (const choice of choices) {
  choice.addEventListener('click', () => {
    const selectedCase = choice.dataset.proofCase;
    for (const button of choices) {
      button.setAttribute('aria-pressed', String(button === choice));
    }
    for (const result of results) {
      result.hidden = result.id !== `proof-${selectedCase}`;
    }
    document.querySelector('#proof-prompt').hidden = true;
    announcement.textContent = selectedCase === 'provable'
      ? '推演已展开：证明 G 会违背系统的自洽性。详细推理位于按钮下方。'
      : '推演已展开：G 在通常的自然数中为真，但在这个系统中不可证明。详细推理位于按钮下方。';
  });
}
