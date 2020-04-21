import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-popup',
    templateUrl: './confirm-popup.component.html',
    styleUrls: ['./confirm-popup.component.scss']
})
export class ConfirmPopupComponent {
    constructor(public dialogRef: MatDialogRef<ConfirmPopupComponent>) {}

    onCancelClick() {
        this.dialogRef.close();
    }
}
