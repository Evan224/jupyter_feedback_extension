import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';
import { INotebookModel, INotebookTracker} from '@jupyterlab/notebook';
import { EventTracker } from './utils/EventTracker';
import { checkAndSendUser } from './utils/initUser';
import { showTooltip, createOrActivateWidget} from './utils';
import { updateSidebarWidget } from './utils';

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
      if (!activeCell?.model){return}
      if(activeCell.model?.type==='code'&&!activeCell.node.contains(document.activeElement)){
        //当cell失去焦点，但是本身又存在的时候，tooltip消失
        const tooltip = document.getElementById('my-tooltip');
        if (tooltip) {
          tooltip.style.display = 'none';  // 隐藏tooltip而不是移除它
        }
        return;
      }
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
          showTooltip(event,app,notebookTracker);
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
          showTooltip(event,app,notebookTracker);
        }
      }
    });
    notebookTracker.activeCellChanged.connect(() => {
      const tooltip = document.getElementById('my-tooltip');
      if (tooltip) {
        tooltip.style.display = 'none';  // 隐藏tooltip而不是移除它
      }
    });
    notebookTracker.activeCellChanged.connect(() => {
      console.log('所以我变了吗')
      updateSidebarWidget(app, notebookTracker);
    });
  },
};



export default extension;