import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';

const extension: JupyterFrontEndPlugin<void> = {
  id: 'my-extension',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    document.addEventListener('mouseup', (event) => {
      const activeCell = notebookTracker.activeCell;
      if (!activeCell){return}
      if (activeCell.model.type === 'code') {
        const codeMirrorEditor: any = activeCell.editor;
        const selectedText = codeMirrorEditor?.getSelection();
        if (selectedText && (selectedText.start.line !== selectedText.end.line || selectedText.start.column !== selectedText.end.column)) {
          showTooltip(event, codeMirrorEditor, "code");
        }
      } else if (activeCell.model.type === "markdown") {
        const selectedText = window.getSelection()?.toString();
        const codeMirrorEditor: any = activeCell.editor;
        if (selectedText && selectedText.trim() !== "") {
          showTooltip(event, codeMirrorEditor, "markdown");
        }
      }
    });
  },
};

function showTooltip(event: MouseEvent, codeMirrorEditor: any, cellType: string) {
  // Create a tooltip element
  const tooltip = document.createElement('div');
  tooltip.innerText = 'My Tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.background = 'lightgray';
  tooltip.style.border = '1px solid black';
  tooltip.style.padding = '5px';
  tooltip.style.zIndex = '1000';

  // Append tooltip to the editor's content DOM
  console.log(codeMirrorEditor,'----------')
  // const contentDom = codeMirrorEditor?.editor.dom;
  // const contentDomRect = codeMirrorEditor?.editor.contentDOM.getBoundingClientRect();
  // contentDom.appendChild(tooltip);
  document.body.appendChild(tooltip);
  // const contentDomRect = contentDom.getBoundingClientRect();

  if (cellType === 'code' || (cellType === 'markdown' && codeMirrorEditor?.editor)) {
    const contentDom = codeMirrorEditor?.editor.dom;
    const contentDomRect = contentDom.getBoundingClientRect();
    tooltip.style.left = event.clientX - contentDomRect.left + 'px';
    tooltip.style.top = event.clientY - contentDomRect.top + 'px';
  } else {
    // For rendered Markdown cells
    tooltip.style.left = event.clientX + 'px';
    tooltip.style.top = event.clientY + 'px';
  }

  // Handle tooltip dismissal
  const onClickOutside = (e: MouseEvent) => {
    if (!tooltip.contains(e.target as Node)) {
      tooltip.remove();
      document.removeEventListener('mousedown', onClickOutside);
    }
  };
  document.addEventListener('mousedown', onClickOutside);
}

export default extension;