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
      if (activeCell && activeCell.model.type === 'code') {
        // Use a type assertion to access the CodeMirror instance
        const codeMirrorEditor: any = activeCell.editor;
        const selectedText = codeMirrorEditor?.getSelection();
        if(selectedText.start.line===selectedText.end.line && selectedText.start.column===selectedText.end.column){
          return;
        }
        if (selectedText) {
          // console.log('Selected Text:', selectedText);

          // Create a tooltip element
          const tooltip = document.createElement('div');
          tooltip.innerText = 'My Tooltip';
          tooltip.style.position = 'absolute';
          tooltip.style.background = 'lightgray';
          tooltip.style.border = '1px solid black';
          tooltip.style.padding = '5px';
          tooltip.style.zIndex = '1000';

          // Append tooltip to the editor's content DOM
          const contentDom = codeMirrorEditor?.editor.dom;
          contentDom.appendChild(tooltip);
          const contentDomRect = contentDom.getBoundingClientRect();

          // Calculate position and display tooltip
          tooltip.style.left = event.clientX-contentDomRect.left + 'px';
          tooltip.style.top = event.clientY-contentDomRect.top + 'px';

          // Handle tooltip dismissal
          const onClickOutside = (e: MouseEvent) => {
            if (!tooltip.contains(e.target as Node)) {
              contentDom.removeChild(tooltip);
              document.removeEventListener('mousedown', onClickOutside);
            }
          };
          document.addEventListener('mousedown', onClickOutside);
          
        }
      }
    });
  },
};

export default extension;
