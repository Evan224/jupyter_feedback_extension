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
    console.log("test if the hot reload works??OKOK");

    const createPopup = (event: MouseEvent, cellContent: string) => {
      // Remove existing popups
      document.querySelectorAll(".text-select-popup").forEach((popup) => {
        popup.remove();
      });

      // Create a new popup
      const popup = document.createElement("div");
      popup.className = "text-select-popup";
      popup.style.position = "fixed";
      popup.style.top = `${event.clientY}px`;
      popup.style.left = `${event.clientX}px`;
      popup.style.backgroundColor = "#f0f0f0";
      popup.style.border = "1px solid #ccc";
      popup.style.padding = "5px";
      popup.style.zIndex = "1000"; // Ensure popup is above other elements

      // Add a button or other UI elements to the popup
      const button = document.createElement("button");
      button.innerText = "Rate";
      button.addEventListener("click", () => {
        if (!currentRatingWidget) {
          currentRatingWidget = new RatingWidget(cellContent);
          app.shell.add(currentRatingWidget, "right");
        } else {
          currentRatingWidget.updateContent(cellContent);
        }
        app.shell.activateById(currentRatingWidget.id);
        popup.remove(); // Remove the popup when button is clicked
      });
      popup.appendChild(button);

      // Add the popup to the document body
      document.body.appendChild(popup);
    };

    // Event listener for text selection
    document.addEventListener("mouseup", (event) => {
      const cell = tracker.activeCell;
      if (cell && cell.model.type === "code") {
        const selectedText = document.getSelection()?.toString();
        if (selectedText) {
          const codeCellModel = cell.model as CodeCellModel;
          const cellContent = codeCellModel.sharedModel.source;
          createPopup(event, cellContent);
        }
      }
    });
  },
};

export default extension;
