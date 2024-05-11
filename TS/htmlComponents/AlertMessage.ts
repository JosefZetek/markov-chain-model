export class AlertMessage {
    private message: string;
    constructor(message: string) {
        this.message = message;
    }

    public showAlertDanger() {
        this.showAlert("alert-danger");
    }

    public showAlertWarning() {
        this.showAlert("alert-warning");
    }

    private showAlert(alertType: string) {
        let html = require('../../HTML/alertMessage.html');

        document.getElementById("alertMessageDiv").insertAdjacentHTML('afterbegin', html);
        document.getElementById("alertMessage").classList.add(alertType);
        this.setMessage();
    }

    private setMessage() {
        document.getElementById("alertMessageText").textContent = this.message;

    }

}