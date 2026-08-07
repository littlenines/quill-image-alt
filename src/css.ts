export const CSS = `
.ql-alt-badge {
  position: absolute;
  z-index: 20;
  display: none;
  align-items: center;
  padding: 2px 6px;
  font: 600 10px/1.4 ui-monospace, Consolas, monospace;
  letter-spacing: 0.03em;
  color: var(--ql-alt-badge-text, #fff);
  background: var(--ql-alt-badge-bg, #333);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.ql-alt-badge.ql-alt-anchor-top-left {
  transform: translate(-40%, -40%);
}
.ql-alt-badge.ql-alt-anchor-top-center {
  transform: translate(-50%, -60%);
}
.ql-alt-badge.ql-alt-anchor-top-right {
  transform: translate(-60%, -40%);
}
.ql-alt-badge.ql-alt-anchor-bottom-left {
  transform: translate(-40%, -60%);
}
.ql-alt-badge.ql-alt-anchor-bottom-center {
  transform: translate(-50%, -40%);
}
.ql-alt-badge.ql-alt-anchor-bottom-right {
  transform: translate(-60%, -60%);
}

.ql-alt-badge.is-missing {
  background: var(--ql-alt-badge-missing-bg, #d9822b);
}

.ql-alt-badge:hover {
  filter: brightness(1.1);
}

.ql-alt-popover {
  position: absolute;
  z-index: 21;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 210px;
  padding: 6px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ql-alt-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ql-alt-input {
  flex: 1;
  min-width: 0;
  padding: 4px 6px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.ql-alt-save {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: #333;
  color: #fff;
  cursor: pointer;
}

.ql-alt-save:hover {
  filter: brightness(1.1);
}

.ql-alt-hint {
  font-size: 10px;
  color: #999;
}
`.trim()
