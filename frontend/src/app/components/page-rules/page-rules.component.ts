import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-page-rules',
    templateUrl: './page-rules.component.html',
    styleUrls: ['./page-rules.component.scss']
})
export class PageRulesComponent implements OnInit {

    constructor(
        private location: Location) {
    }

    ngOnInit(): void {
    }

    onBackClick() {
        this.location.back();
    }
}
