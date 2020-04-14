import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<ConfirmComponent>) { }

    ngOnInit(): void {
    }

    onCancelClick() {
        this.dialogRef.close();
    }
}
