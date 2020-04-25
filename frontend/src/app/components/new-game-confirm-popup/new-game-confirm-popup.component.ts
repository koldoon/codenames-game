import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-new-game-confirm-popup',
    templateUrl: './new-game-confirm-popup.component.html',
    styleUrls: ['./new-game-confirm-popup.component.scss']
})
export class NewGameConfirmPopupComponent {
    constructor(public dialogRef: MatDialogRef<NewGameConfirmPopupComponent>) {}

    onCancelClick() {
        this.dialogRef.close();
    }
}
