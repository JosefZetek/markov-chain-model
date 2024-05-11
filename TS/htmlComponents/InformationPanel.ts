import { NodeGroupsActions } from '../actions/NodeGroupsActions';

/**
 * Trida pro zobrazeni skupin stavu v prave casti aplikace
 */
export class InformationPanel {

    private graphNameLabel: HTMLElement;
    private graphNameInput: HTMLInputElement;
    private graphDescriptionLabel: HTMLElement;
    private graphDescriptionTextArea: HTMLElement;


    constructor(parentElement: HTMLElement) {
        this.createGraphNameLabel(parentElement);
        this.createInputNameField(parentElement);
        this.createGraphDescriptionLabel(parentElement);
        this.createInputTextArea(parentElement);
    }

    private createGraphNameLabel(parentElement: HTMLElement) {
        this.graphNameLabel = document.createElement("label");
        this.graphNameLabel.className = "input_field_label";
        this.graphNameLabel.innerHTML = "Graph Name";
        parentElement.appendChild(this.graphNameLabel);
    }

    private createInputNameField(parentElement: HTMLElement) {
        this.graphNameInput = document.createElement("input");
        this.graphNameInput.className = "input_field";
        this.graphNameInput.placeholder = "Insert Graph Name";
        this.graphNameInput.id = "graphName";
        parentElement.appendChild(this.graphNameInput);
    }

    private createGraphDescriptionLabel(parentElement: HTMLElement) {
        this.graphDescriptionLabel = document.createElement("label");
        this.graphDescriptionLabel.className = "input_field_label";
        this.graphDescriptionLabel.innerHTML = "Graph Description";
        parentElement.appendChild(this.graphDescriptionLabel);
    }

    private createInputTextArea(parentElement: HTMLElement) {
        this.graphDescriptionTextArea = document.createElement("textarea");
        this.graphDescriptionTextArea.className = "input_field";
        this.graphDescriptionTextArea.setAttribute("placeholder", "Insert Graph Description");
        this.graphDescriptionTextArea.id = "graphDescription";

        parentElement.appendChild(this.graphDescriptionTextArea);
    }

    public hidden(hidden: boolean) {
        this.graphNameLabel.hidden = hidden;
        this.graphNameInput.hidden = hidden;
        this.graphDescriptionLabel.hidden = hidden;
        this.graphDescriptionTextArea.hidden = hidden;
    }


    public setName(name: string) {
        const element = <HTMLInputElement>document.getElementById("graphName");

        if(element == null) {
            alert("Graph name field was not loaded for unknown reasons. Try to refresh the page.");
            return;
        }

        element.value = (name == undefined) ? "" : name;
    }

    public getName(): string {
        const element = <HTMLInputElement>document.getElementById("graphName");
        return element == null ? "" : element.value;
    }

    public setDescription(description: string) {
        const element = <HTMLInputElement>document.getElementById("graphDescription");

        if(element == null) {
            alert("Graph name field was not loaded for unknown reasons. Try to refresh the page.");
            return;
        }

        element.value = (description == undefined) ? "" : description;
    }

    public getDescription(): string {
        const element = <HTMLInputElement>document.getElementById("graphDescription");
        return element == null ? "" : element.value;
    }
}