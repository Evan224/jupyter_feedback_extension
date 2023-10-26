import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookModel, INotebookTracker} from '@jupyterlab/notebook';
import { EventTracker } from './utils/EventTracker';
import { checkAndSendUser } from './utils/initUser';
import { showTooltip, createOrActivateWidget} from './utils';

const eventTracker = new EventTracker('http://localhost:3000/events');

const extension: JupyterFrontEndPlugin<void> = {
  id: 'my-extension',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, notebookTracker: INotebookTracker) => {
    checkAndSendUser();
    eventTracker.registerJupyterLabEventListeners(notebookTracker);
    
    document.addEventListener('mouseup', (event) => {
      const activeCell = notebookTracker.activeCell;
      // const codeMirrorEditor: any = activeCell?.editor;
      // const selectedText = codeMirrorEditor?.getSelection();
      if (!activeCell?.model){return}
      if (activeCell.model?.type && activeCell.model?.type === 'code') {
        const codeMirrorEditor: any = activeCell?.editor;
        const selectedText = codeMirrorEditor?.getSelection();
        if (selectedText && (selectedText.start.line !== selectedText.end.line || selectedText.start.column !== selectedText.end.column)) {
          eventTracker.sendEvent('code-selection', {
            cellId: activeCell.model.id,
            selectedText: selectedText,
            currentListOrder:activeCell?.dataset?.windowedListIndex,
            // @ts-ignore
            currentPromptNumber: activeCell.prompt,
          });
          showTooltip(event, {...selectedText,selected_text:window.getSelection()?.toString(),editor:codeMirrorEditor}, "code",app);
        }
      } else if (activeCell.model?.type === "markdown") {
        const selectedText = window.getSelection()?.toString();
        if (selectedText && selectedText.trim() !== "") {
          eventTracker.sendEvent('code-selection', {
            cellId: activeCell.model.id,
            selectedText: selectedText,
            currentListOrder:activeCell?.dataset?.windowedListIndex,
            // @ts-ignore
            currentPromptNumber: activeCell.prompt,
          });
          showTooltip(event, {editor:activeCell.editor}, "markdown",app);
        }
      }
    });
    notebookTracker.activeCellChanged.connect(() => {
      const tooltip = document.getElementById('my-tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });


  },
};



export default extension;