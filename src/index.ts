import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { INotebookTracker } from "@jupyterlab/notebook";
import { RatingWidget } from "./RatingComponent";
import { CodeCellModel } from "@jupyterlab/cells";

const extension: JupyterFrontEndPlugin<void> = {
  id: "rating-extension",
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker) => {
    let currentRatingWidget: RatingWidget | null = null;

    const updateButton = () => {
      // Remove all existing rate buttons
      document.querySelectorAll(".rate-button").forEach((button) => {
        button.remove();
      });

      // Add rate button to the active cell
      const cell = tracker.activeCell;
      if (cell && cell.model.type === "code") {
        const button = document.createElement("button");
        button.innerText = "Rate";
        button.className = "rate-button";
        button.addEventListener("click", () => {
          const codeCellModel = cell.model as CodeCellModel;
          console.log(codeCellModel);
          const cellContent = codeCellModel.sharedModel.source;
          if (!currentRatingWidget) {
            currentRatingWidget = new RatingWidget(cellContent);
            app.shell.add(currentRatingWidget, "right");
          } else {
            currentRatingWidget.updateContent(cellContent);
          }
          app.shell.activateById(currentRatingWidget.id);
        });
        cell.node.appendChild(button);
      }
    };

    // Update the rate button whenever the active cell changes
    tracker.activeCellChanged.connect(updateButton);

    // Initial button setup
    updateButton();
  },
};

export default extension;
